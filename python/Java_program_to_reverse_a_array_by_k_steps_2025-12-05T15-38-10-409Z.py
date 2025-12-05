/*
Title: Java_program_to_reverse_a_array_by_k_steps_2025-12-05T15-38-10-409Z.py
Description: 
Date: 12/5/2025, 9:08:10 PM
*/

import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6, 7};
        int k = 3;
        System.out.println("Original Array: " + Arrays.toString(arr));
        int[] reversedArr = reverseArrayByKSteps(arr, k);
        System.out.println("Reversed Array by " + k + " steps: " + Arrays.toString(reversedArr));
    }

    public static int[] reverseArrayByKSteps(int[] arr, int k) {
        int n = arr.length;
        k = k % n;
        int[] temp = new int[n];
        System.arraycopy(arr, n - k, temp, 0, k);
        System.arraycopy(arr, 0, temp, k, n - k);
        return temp;
    }
}