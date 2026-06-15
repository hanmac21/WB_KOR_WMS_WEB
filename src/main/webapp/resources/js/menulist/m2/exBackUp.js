/* --------------------------------------------------------------
 * 📌 구매 - 입고 - 평택입고
 * 비고: 
 * -------------------------------------------------------------- */





$(document).ready(function(){
	
	
	window.call_m2_1 = function () {
		let content_output = `
			<div class="divBlockControl" id="view_m2_1">
				<div class="w_ex_insertDataArea_1">
					<div class="w_ex_insert_1_top">
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon shortSize">입고일자</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon longSize"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon shortSize">입고유형</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon longSize"/>
							</div>
						</div>
					</div>
					<div class="w_ex_insert_1_bottom">
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon shortSize">거래처명</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon longSize"/>
							</div>
						</div>
						<div class="w_ex_insertCommon shortSize">
							<div class="w_ex_titleCommon shortSize">창고</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon longSize"/>
							</div>
						</div>
					</div>
					<div class="w_ex_insert_2_top">
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">바코드</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">제품명</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">제품코드</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">제조일자</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
					</div>
					<div class="w_ex_insert_2_bottom">
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">규격</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">단위</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">수량</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
						<div class="w_ex_insertCommon">
							<div class="w_ex_titleCommon">Lot번호</div>
							<div>
								<input type="text" class="w_ex_textBoxCommon"/>
							</div>
						</div>
					</div>
				</div>
				<!-- <div class="w_ex_insertDataArea_2"> -->
				<!-- </div> -->
				
				<div class="w_ex_titleButtonArea">
					<div class="w_ex_titleButtonBack">
						<input type="button" class="w_ex_insertBtn" value="등록">
					</div>
				</div>
				
				<div class="w_ex_insertDataList">
					<table>
						<thead>
							<tr>
								<th scope="col">No</th>
								<th scope="col">제품</th>
								<th scope="col">제품코드</th>
								<th scope="col">창고</th>
								<th scope="col">입고 유형</th>
								<th scope="col">규격</th>
								<th scope="col">단위</th>
								<th scope="col">수량</th>
								<th scope="col">바코드</th>
								<th scope="col">메모</th>
							</tr>
						</thead>
						<tbody>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
							<tr>
							  <td></td><td></td><td></td><td></td><td></td>
							  <td></td><td></td><td></td><td></td><td></td>
							</tr>
						</tbody>
					</table>
					<div class="w_example_pageBtn">
						<div class="w_ex_pageArea">
							<div class="w_ex_pageCommon bold">&lt;</div>
							<div class="w_ex_pageCommon bold" style="background: #0385d9; color:white">1</div>
							<div class="w_ex_pageCommon">2</div>
							<div class="w_ex_pageCommon">3</div>
							<div class="w_ex_pageCommon bold">&gt;</div>
						</div>
					</div>
				</div>			
			
			</div>
			
		
		`;
		
		
		
		$(".w_contentArea").prepend(content_output);
		
	}	

});








