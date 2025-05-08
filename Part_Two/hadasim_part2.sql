USE master
CREATE DATABASE Hadasim
GO

USE Hadasim
--function for validate ID
GO
CREATE FUNCTION ID(@ID varchar(9))
RETURNS bit
AS
	BEGIN
	DECLARE @sum int = 0, @I int = 1, @num int 
	WHILE @I<=9
	BEGIN
		SET @num = CAST(LEFT(RIGHT(@ID,@I),1) AS int)
		IF @I % 2=0
		BEGIN
			SET @num = @num*2
			SET @num=@num/10 + @num % 10
		END
		SET @sum=@sum+@num
		SET @I=@I + 1
    END
	IF @sum % 10 = 0 
		RETURN 1
	RETURN 0
	END
GO



--create the base table of the people
CREATE TABLE Person
(
	Person_Id varchar(9) CHECK(dbo.ID(Person_Id)=1) PRIMARY KEY,
	Personal_Name varchar(15) NOT NULL,
	Family_Name varchar(15) NOT NULL,
	Gender varchar(6) NOT NULL CHECK(Gender IN ('Male', 'Female')),
	Father_Id varchar(9),
	Mother_Id varchar(9),
	Spouse_Id varchar(9),

	CONSTRAINT FK_Father FOREIGN KEY (Father_Id) REFERENCES Person(Person_Id), --ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT FK_Mother FOREIGN KEY (Mother_Id) REFERENCES Person(Person_Id), --ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT FK_Spouse FOREIGN KEY (Spouse_Id) REFERENCES Person(Person_Id) --ON DELETE NO ACTION ON UPDATE NO ACTION
)
GO
--create the table of description realation in the table Person
CREATE TABLE Relations
(
	Person_Id varchar(9),
	Relative_Id varchar(9),
	Connection_Type varchar(8) NOT NULL CHECK(Connection_Type IN ('Father','Mother','Brother','Sister','Son','Daughter','FSpouse','MSpouse')),
	PRIMARY KEY(Person_Id,Relative_Id),
	CONSTRAINT FK_Person FOREIGN KEY (Person_Id) REFERENCES Person(Person_Id) ,--ON DELETE NO ACTION ON UPDATE NO ACTION,
	CONSTRAINT FK_Relative FOREIGN KEY (Person_Id) REFERENCES Person(Person_Id) --ON DELETE NO ACTION ON UPDATE NO ACTION
)
GO

--create the trigger when inserting details to table Peson table Realation should be update else
CREATE TRIGGER trg_InsertRelations
ON Person
FOR INSERT
AS
BEGIN
	SET NOCOUNT ON --מסיר הודעות מערכת וזה משפר ביצועים

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
    SELECT i.Person_Id, i.Father_Id, 'Father'
    FROM inserted i
    WHERE i.Father_Id IS NOT NULL

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
    SELECT i.Father_Id, i.Person_Id, 'Son'
    FROM inserted i
    WHERE i.Father_Id IS NOT NULL AND i.Gender = 'Male'

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
    SELECT i.Father_Id, i.Person_Id, 'Daughter'
    FROM inserted i
    WHERE i.Father_Id IS NOT NULL AND i.Gender = 'Female'

    INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
    SELECT i.Person_Id, i.Mother_Id, 'Mother'
    FROM inserted i
    WHERE i.Mother_Id IS NOT NULL

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
    SELECT i.Mother_Id, i.Person_Id, 'Son'
    FROM inserted i
    WHERE i.Mother_Id IS NOT NULL AND i.Gender = 'Male'

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
    SELECT i.Mother_Id, i.Person_Id, 'Daughter'
    FROM inserted i
    WHERE i.Mother_Id IS NOT NULL AND i.Gender = 'Female'
	
/*		INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
		SELECT i.Person_Id, i.Spouse_Id, 'MSpouse'
		FROM inserted i
		WHERE i.Spouse_Id IS NOT NULL AND 'Male' = (SELECT Gender FROM Person WHERE i.Spouse_Id = Person_Id)
*/
	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT i.Person_Id, i.Spouse_Id, 'MSpouse'
	FROM inserted i JOIN Person p ON i.Spouse_Id IS NOT NULL AND i.Spouse_Id = p.Person_Id
	WHERE p.Gender = 'Male'

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT i.Person_Id, i.Spouse_Id, 'FSpouse'
	FROM inserted i JOIN Person p ON i.Spouse_Id IS NOT NULL AND i.Spouse_Id = p.Person_Id
	WHERE p.Gender = 'Female'

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT i.Spouse_Id ,i.Person_Id , 'FSpouse'
	FROM inserted i JOIN Person p ON i.Spouse_Id IS NOT NULL AND i.Spouse_Id = p.Person_Id
	WHERE p.Spouse_Id IS NULL AND 'Female' = i.Gender

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT i.Spouse_Id ,i.Person_Id , 'MSpouse'
	FROM inserted i JOIN Person p ON i.Spouse_Id IS NOT NULL AND i.Spouse_Id = p.Person_Id
	WHERE p.Spouse_Id IS NULL AND 'Male' = i.Gender
	
	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT i.Person_Id ,p.Person_Id , 'Brother'
	FROM inserted i JOIN Person p 
	ON i.Person_Id != p.Person_Id AND (i.Father_Id = p.Father_Id OR i.Mother_Id = p.Mother_Id) AND p.Gender = 'Male'

	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT i.Person_Id ,p.Person_Id , 'Sister'
	FROM inserted i JOIN Person p 
	ON i.Person_Id != p.Person_Id AND (i.Father_Id = p.Father_Id OR i.Mother_Id = p.Mother_Id) AND p.Gender = 'Female'
	
	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT p.Person_Id ,i.Person_Id , 'Brother'
	FROM inserted i JOIN Person p 
	ON i.Person_Id != p.Person_Id AND (i.Father_Id = p.Father_Id OR i.Mother_Id = p.Mother_Id) AND i.Gender = 'Male'
	WHERE NOT EXISTS (SELECT 1 FROM Relations WHERE Person_Id = p.Person_Id AND Relative_Id = i.Person_Id)
	
	INSERT INTO Relations(Person_Id, Relative_Id, Connection_Type)
	SELECT p.Person_Id ,i.Person_Id , 'Sister'
	FROM inserted i JOIN Person p 
	ON i.Person_Id != p.Person_Id AND (i.Father_Id = p.Father_Id OR i.Mother_Id = p.Mother_Id) AND i.Gender = 'Female'
	WHERE NOT EXISTS (SELECT 1 FROM Relations WHERE Person_Id = p.Person_Id AND Relative_Id = i.Person_Id)
END
GO

--טריגר שמדכן נתונים לטבלת relations ולטבלת person כאשר מעדכנים את person_id
GO
CREATE TRIGGER trg_UpdateRelationsPerson
ON Person
FOR UPDATE
AS
BEGIN
	SET NOCOUNT ON

	IF UPDATE(Person_Id) --הטריגר עובד רק אם העמודה הספציפית שונתה (כי זה מה שבאמת צריך) וכך נחסך זמן ריצה מיותר אם שונה משהו אחר
	BEGIN
		UPDATE Relations
		SET Person_Id = i.Person_Id
		FROM Relations r JOIN inserted i 
		ON r.Person_Id = i.Person_Id

		UPDATE Relations
		SET Relative_Id = i.Person_Id
		FROM Relations r JOIN inserted i
		ON r.Relative_Id = i.Person_Id

		UPDATE Person
		SET Father_Id = i.Person_Id
		FROM Person p JOIN inserted i
		ON p.Father_Id = i.Person_Id

		UPDATE Person
		SET Mother_Id = i.Person_Id
		FROM Person p JOIN inserted i
		ON p.Mother_Id = i.Person_Id

		UPDATE Person
		SET Spouse_Id = i.Person_Id
		FROM Person p JOIN inserted i
		ON p.Spouse_Id = i.Person_Id
	END
END
GO

--Person טריגר שמוחק את הנתונים הרלוונטים כשמוחקים רשומה מטבלת 
CREATE TRIGGER trg_DeleteRelationsPerson
ON Person
FOR DELETE
AS
BEGIN
	SET NOCOUNT ON

	DELETE Relations
    WHERE Person_Id IN (SELECT Person_Id FROM deleted)
	OR Relative_Id IN (SELECT Person_Id FROM deleted)

	UPDATE Person
	SET Father_Id = NULL
	FROM Person p JOIN deleted D
	ON p.Father_Id = D.Person_Id

	UPDATE Person
	SET Mother_Id = NULL
	FROM Person p JOIN deleted D
	ON p.Mother_Id = D.Person_Id

	UPDATE Person
	SET Spouse_Id = NULL
	FROM Person p JOIN deleted D
	ON p.Spouse_Id = D.Person_Id
END
GO

--...אין אפשרות לשנות מגדר כדי לא להכנס לסיבוכים שאבא יוגדר כבת וכדומה
GO
CREATE TRIGGER trg_UpdateGender
ON Person
AFTER UPDATE
AS
BEGIN
	IF UPDATE(Gender)
	BEGIN
		RAISERROR('Error: There is no option to change Gender.', 16, 1)
		ROLLBACK TRANSACTION
	END
END
GO

--בדיקת תקינות אם אבא הוא זכר ואם אמא היא נקבה
GO
CREATE TRIGGER trg_ValidateParentsGender
ON Person
FOR INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON

    -- בדיקה אם יש אב שאינו ממגדר זכר
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN Person p ON i.Father_Id = p.Person_Id
        WHERE p.Gender != 'Male'
    )
    BEGIN
        RAISERROR('Error: Father must be male.', 16, 1)
		ROLLBACK TRANSACTION
    END

    -- בדיקה אם יש אם שאינה ממגדר נקבה
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN Person p ON i.Mother_Id = p.Person_Id
        WHERE p.Gender != 'Female'
    )
    BEGIN
        RAISERROR('Error: Mother must be female.', 16, 1)
		ROLLBACK TRANSACTION
    END
END
GO

--שינוי סדר הפעולות של הטריגרים
EXEC sp_settriggerorder 
    @triggername = 'trg_ValidateParentsGender', 
    @order = 'FIRST', 
    @stmttype = 'INSERT'

EXEC sp_settriggerorder 
    @triggername = 'trg_ValidateParentsGender', 
    @order = 'FIRST', 
    @stmttype = 'UPDATE'

--insert details to table Person
INSERT INTO Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id)
VALUES 
('123456782', 'David', 'Levi', 'Male', '215806357', '217575901', NULL),
('215806357', 'Moshe', 'Levi', 'Male', NULL, NULL, '217575901'),
('217575901', 'Rivka', 'Levi', 'Female', NULL, NULL, '215806357'),
('218929172', 'Sarah', 'Cohen', 'Female', '123456782', '221267230', NULL),
('221267230', 'Yael', 'Cohen', 'Female', NULL, NULL, NULL),
('341900041', 'Avi', 'Cohen', 'Male', NULL, NULL, '221267230'),
('037117140', 'Dina', 'Cohen', 'Female', '123456782', '221267230', NULL)
GO

SELECT * FROM Person
SELECT * FROM Relations



