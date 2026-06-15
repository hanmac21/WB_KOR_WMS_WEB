package com.example.demo.utils;

public class SqlUtils {

	/**
	 * LIKE 검색용 특수문자 이스케이프 처리 SQL LIKE 검색에서 특수 의미를 가지는 문자들을 일반 문자로 처리하도록 이스케이프
	 * 
	 * @param input 원본 검색어
	 * @return 이스케이프 처리된 검색어
	 */
	public static String escapeLikePattern(String input) {
		if (input == null || input.isEmpty()) {
			return input;
		}
		
		System.out.println("변환될 itemname");
		System.out.println(input);
		return input.replace("\\", "\\\\") // 백슬래시 (가장 먼저 처리해야 함)
				.replace("_", "\\_") // 언더스코어 (단일 문자 와일드카드)
				.replace("%", "\\%") // 퍼센트 (다중 문자 와일드카드)
				.replace("(", "\\(") // 왼쪽 괄호
				.replace(")", "\\)") // 오른쪽 괄호
				.replace("[", "\\[") // 왼쪽 대괄호
				.replace("]", "\\]"); // 오른쪽 대괄호
	}

	/**
	 * 짧은 이름의 메소드 (편의용)
	 */
	public static String escapeLike(String input) {
		return escapeLikePattern(input);
	}

	/**
	 * 여러 개의 검색어를 한번에 이스케이프 처리
	 * 
	 * @param inputs 검색어 배열
	 * @return 이스케이프 처리된 검색어 배열
	 */
	public static String[] escapeLikePatterns(String... inputs) {
		if (inputs == null) {
			return null;
		}

		String[] results = new String[inputs.length];
		for (int i = 0; i < inputs.length; i++) {
			results[i] = escapeLikePattern(inputs[i]);
		}
		return results;
	}
}