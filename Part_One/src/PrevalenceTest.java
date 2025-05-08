package Part_One;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicIntegerArray;
import java.util.concurrent.locks.*;
import java.util.LinkedList;
import java.util.List;
import Part_One.Pair;

public class PrevalenceTest {

	private static final int ARRAY_SIZE = 500; // גודל המערך לכל קובץ
	private static AtomicIntegerArray globalArray = new AtomicIntegerArray(ARRAY_SIZE); // מערך משותף

	public void InsertingFrequency(Path file, int[] arr) throws IOException {
		BufferedReader reader = Files.newBufferedReader(file);
		String line;
		while ((line = reader.readLine()) != null) {
			String[] words = line.split("_");
			String error = words[1].substring(0, words[1].length() - 1);
			int place = Integer.parseInt(error) - 100;
			if (place >= 0 && place < arr.length) { // בדיקה למניעת חריגה

				arr[place]++;
			}
		}
		reader.close();

	}

	public static void mergeArrays(int[] localArray) {
		for (int i = 0; i < ARRAY_SIZE; i++) {
			globalArray.addAndGet(i, localArray[i]); // סכימה בטוחה
		}
	}

	// הדפסת המערך המאוחד
	public static void printGlobalArray() {
		System.out.println("תוצאות סופיות:");
		int sum = 0;
		for (int i = 0; i < ARRAY_SIZE; i++) {
			System.out.println("אינדקס " + i + ": " + globalArray.get(i));
			sum += globalArray.get(i);
		}
		System.out.println(sum);
	}
//	public static void printArr() {
//		for (int i = 0; i < arr.length; i++) {
//			System.out.println(i + " " + arr[i]);
//
//		}
//	}

	public static List<Pair> ReturnsTheCommons(int N) {
	    List<Pair> commons = new LinkedList<>();
	    int max, used = -1;

	    while (N > 0) {
	        max = 0;
	        int prevUsed = used; // זוכר את הערך האחרון שנבחר

	        for (int i = 0; i < globalArray.length(); i++) {
	            if (globalArray.get(i) > max && i != used && (used == -1 || globalArray.get(i) < globalArray.get(prevUsed))) {
	                max = globalArray.get(i);
	                used = i;
	            }
	        }

	        // אם לא נמצא ערך מתאים, צא מהלולאה
	        if (max == 0) {
	            System.out.println("לא נמצאו עוד ערכים מתאימים להפחתה.");
	            break;
	        }

	        N -= max;
	        commons.add(new Pair(used, max));
	    }

	    return commons;
	}

}
