package Part_One;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import Part_One.PrevalenceTest;
import java.util.concurrent.atomic.AtomicIntegerArray;

public class FileProcesson1 {

    private static final int REQUIRED_FILES_COUNT = 10; // כמות הקבצים הצפויה

    public void processFiles(String directoryPath) throws InterruptedException, ExecutionException {
        int numThreads = 1000; // מספר תהליכונים מקביליים
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CompletionService<Void> completionService = new ExecutorCompletionService<>(executor);

        List<Path> filesList = new ArrayList<>();

        try (Stream<Path> paths = Files.walk(Paths.get(directoryPath))) {
            filesList = paths.filter(Files::isRegularFile)
                    .filter(file -> file.getFileName().toString().startsWith("output") && file.getFileName().toString().endsWith(".txt"))
                    .sorted(Comparator.comparing(Path::getFileName))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        System.out.println(" נמצאו " + filesList.size() + " קבצים לעיבוד.");

        // בדיקה אם חסרים קבצים
        if (filesList.size() < REQUIRED_FILES_COUNT) {
            System.out.println(" שגיאה: נמצאו רק " + filesList.size() + " מתוך " + REQUIRED_FILES_COUNT + " הקבצים!");
            printMissingFiles(filesList);
            return;
        }

        // שליחה של כל קובץ לעיבוד עם CompletionService
        for (Path file : filesList) {
            completionService.submit(() -> {
                int[] arr = new int[500]; // יצירת מערך נפרד לכל תהליך
                processFile(file, arr);
                return null;
            });
        }

        // קבלת תוצאות מכל התהליכונים כדי לוודא שכולם רצו
        for (int i = 0; i < filesList.size(); i++) {
            completionService.take(); // מחכה שכל תהליך יסתיים
        }

        executor.shutdown();
        if (!executor.awaitTermination(5, TimeUnit.MINUTES)) {
            System.out.println(" חלק מהמשימות לא הסתיימו בזמן!");
        }

        System.out.println(" העיבוד הושלם.");
        PrevalenceTest.printGlobalArray(); // הדפסת המערך המאוחד

    }

    private void printMissingFiles(List<Path> foundFiles) {
        Set<String> foundFileNames = foundFiles.stream()
                .map(file -> file.getFileName().toString())
                .collect(Collectors.toSet());

        System.out.println(" קבצים חסרים:");
        for (int i = 1; i <= REQUIRED_FILES_COUNT; i++) {
            String expectedFileName = "output_" + i + ".txt";
            if (!foundFileNames.contains(expectedFileName)) {
                System.out.println(" חסר: " + expectedFileName);
            }
        }
    }

    public static void processFile(Path file, int [] arr) {
        try {
            System.out.println(" מעבד את הקובץ: " + file);
            PrevalenceTest prevalenceTest=new PrevalenceTest();
            prevalenceTest.InsertingFrequency(file, arr);
            PrevalenceTest.mergeArrays(arr);

            }
         catch (Exception e) {
            System.err.println(" שגיאה בעיבוד הקובץ: " + file + " - " + e.getMessage());
        }
    }
}

