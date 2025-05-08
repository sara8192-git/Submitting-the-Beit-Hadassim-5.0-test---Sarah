package Part_One;

import java.io.*;
import java.util.*;

public class FileSplitting {

    // פונקציה לפיצול קובץ
    public static void splitFile(String inputFilePath, int linesPerFile) throws IOException {
        // קריאה לקובץ
    	BufferedReader reader = new BufferedReader(new FileReader(inputFilePath));
        List<String> lines = new ArrayList<>();
        String line;

        // קריאה של כל השורות לקובץ
        while ((line = reader.readLine()) != null) {
            lines.add(line);
        }
        reader.close();

        // פיצול השורות והכתיבה לקבצים חדשים
        int fileCount = 1;
        for (int i = 0; i < lines.size(); i += linesPerFile) {
            // יצירת קובץ חדש
            String outputFilePath = "output_" + fileCount + ".txt";
            BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath));
            
            // כותב את השורות לכל קובץ
            for (int j = i; j < i + linesPerFile && j < lines.size(); j++) {
                writer.write(lines.get(j));
                writer.newLine();
            }

            writer.close();
            fileCount++;
        }

        System.out.println("הקובץ פוצל בהצלחה!");
    }
}