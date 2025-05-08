package Part_One;

import java.io.*;
import Part_One.FileSplitting;
import Part_One.PrevalenceTest;

import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.*;
import Part_One.Pair;

public class Main {

	public static void AllProccess(String inputFilePath, int N) throws ExecutionException {
		FileProcesson1 FileProcesson1 = new FileProcesson1();
		List<Pair> commons = new LinkedList<>();

		try {

			FileSplitting.splitFile(inputFilePath, 100000); // הקריאה לפונקציה הסטטית
			FileProcesson1.processFiles("C:\\Users\\shira.halevy\\Documents\\oop\\Part_One");
			commons=PrevalenceTest.ReturnsTheCommons(N);
			for (int i = 0; i < commons.size(); i++) {
				System.out.println(commons.get(i).getFirst()+" :"+commons.get(i).getSecond());
			}
			

		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) throws ExecutionException {
		// TODO Auto-generated method stub
		String inputFilePath = "C:\\Users\\shira.halevy\\Documents\\oop\\Part_One";
		AllProccess(inputFilePath + "\\logs.txt", 20000);
	}
}