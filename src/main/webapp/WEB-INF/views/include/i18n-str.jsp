<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<script>
	window.I18N = Object.assign(window.I18N || Object.create(null), {
	    // INFO
		"info.loading" : 												"<spring:message code='info.loading' javaScriptEscape='true'/>",	
	    "info.location": 												"<spring:message code='info.location' javaScriptEscape='true'/>",
	    "info.processing": 												"<spring:message code='info.processing' javaScriptEscape='true'/>",
	    "info.retrieving": 												"<spring:message code='info.retrieving' javaScriptEscape='true'/>",
	    "info.enterKeyword": 											"<spring:message code='info.enterKeyword' javaScriptEscape='true'/>",
	    	
	    // ERROR
	    "error.failed.data.load": 										"<spring:message code='error.failed.data.load' javaScriptEscape='true'/>",
	    "error.password.current.invalid": 								"<spring:message code='error.password.current.invalid' javaScriptEscape='true'/>",
	    "error.process.failed": 										"<spring:message code='error.process.failed' javaScriptEscape='true'/>",
	    "error.save.data": 												"<spring:message code='error.save.data' javaScriptEscape='true'/>",
	    
	    // VALIDATION
	    "validation.account.change.password": 							"<spring:message code='validation.account.change.password' javaScriptEscape='true'/>",
	    "validation.account.one": 										"<spring:message code='validation.account.one' javaScriptEscape='true'/>",
	    "validation.account.required": 									"<spring:message code='validation.account.required' javaScriptEscape='true'/>",
	    
	    "validation.access.factory": 									"<spring:message code='validation.access.factory' javaScriptEscape='true'/>",
	    			
	    "validation.department.6code": 									"<spring:message code='validation.department.6code' javaScriptEscape='true'/>",
	    "validation.department.6code.exactly": 							"<spring:message code='validation.department.6code.exactly' javaScriptEscape='true'/>",
	    "validation.department.number": 								"<spring:message code='validation.department.number' javaScriptEscape='true'/>",
	    "validation.department.same": 									"<spring:message code='validation.department.same' javaScriptEscape='true'/>",
	    "validation.department.select": 								"<spring:message code='validation.department.select' javaScriptEscape='true'/>",
	    "validation.department.select.exactly": 						"<spring:message code='validation.department.select.exactly' javaScriptEscape='true'/>",
	    "validation.factory.select.exactly": 							"<spring:message code='validation.factory.select.exactly' javaScriptEscape='true'/>",
	    "validation.department.code": 									"<spring:message code='validation.department.code' javaScriptEscape='true'/>",
	    
	    "validation.duplicate.id": 										"<spring:message code='validation.duplicate.id' javaScriptEscape='true'/>",
	    
	    "validation.enter.currentPassword": 							"<spring:message code='validation.enter.currentPassword' javaScriptEscape='true'/>",
	    "validation.enter.dot": 										"<spring:message code='validation.enter.dot' javaScriptEscape='true'/>",
	    "validation.enter.id": 											"<spring:message code='validation.enter.id' javaScriptEscape='true'/>",
	    "validation.enter.idPassword": 									"<spring:message code='validation.enter.idPassword' javaScriptEscape='true'/>",
	    "validation.enter.name": 										"<spring:message code='validation.enter.name' javaScriptEscape='true'/>",
	    "validation.enter.newPassword": 								"<spring:message code='validation.enter.newPassword' javaScriptEscape='true'/>",
	    "validation.enter.password": 									"<spring:message code='validation.enter.password' javaScriptEscape='true'/>",
	    "validation.login": 											"<spring:message code='validation.login' javaScriptEscape='true'/>",
	    
	    "validation.password.same": 									"<spring:message code='validation.password.same' javaScriptEscape='true'/>",
	    
	    "validation.id.space": 											"<spring:message code='validation.id.space' javaScriptEscape='true'/>",
	    	
	    "validation.required.factory": 									"<spring:message code='validation.required.factory' javaScriptEscape='true'/>",

	    "validation.confirm.items": 									"<spring:message code='validation.confirm.items' javaScriptEscape='true'/>",
	    "validation.confirm.items.delete": 								"<spring:message code='validation.confirm.items.delete' javaScriptEscape='true'/>",
	    "validation.unconfirm.items": 									"<spring:message code='validation.unconfirm.items' javaScriptEscape='true'/>",
	    "validation.no.select.items": 									"<spring:message code='validation.no.select.items' javaScriptEscape='true'/>",
	    "validation.interface.tryAgain": 								"<spring:message code='validation.interface.tryAgain' javaScriptEscape='true'/>",
	    "validation.no.change.items": 									"<spring:message code='validation.no.change.items' javaScriptEscape='true'/>",
	    
	    // WARNING
	    "warning.login.account": 										"<spring:message code='warning.login.account' javaScriptEscape='true'/>",	    	    
	    "warning.session.expired": 										"<spring:message code='warning.session.expired' javaScriptEscape='true'/>",	    	    
	    "warning.tab.limit": 											"<spring:message code='warning.tab.limit' javaScriptEscape='true'/>",	    	    
	    "warning.closed.storage": 										"<spring:message code='warning.closed.storage' javaScriptEscape='true'/>",	    	    
	    "warning.closed.workshop": 										"<spring:message code='warning.closed.workshop' javaScriptEscape='true'/>",
	    "warning.locked": 												"<spring:message code='warning.locked' javaScriptEscape='true'/>",	    	    
	    "warning.decomposition.limit": 									"<spring:message code='warning.decomposition.limit' javaScriptEscape='true'/>",
	    "warning.decomposition.parentChanged": 							"<spring:message code='warning.decomposition.parentChanged' javaScriptEscape='true'/>",
	    
	    // CONFIRMATION
	    "confirmation.account.enable": 									"<spring:message code='confirmation.account.enable' javaScriptEscape='true'/>",	    	    
	    "confirmation.account.delete": 									"<spring:message code='confirmation.account.delete' javaScriptEscape='true'/>",	    	    
	    "confirmation.account.block": 									"<spring:message code='confirmation.account.block' javaScriptEscape='true'/>",	    	    
	    "confirmation.permission.revoked": 								"<spring:message code='confirmation.permission.revoked' javaScriptEscape='true'/>",	    	    
	    "confirmation.permission.save": 								"<spring:message code='confirmation.permission.save' javaScriptEscape='true'/>",	    	    
	    "confirmation.interface.progress": 								"<spring:message code='confirmation.interface.progress' javaScriptEscape='true'/>",	    	    
	    "confirmation.items.delete": 									"<spring:message code='confirmation.items.delete' javaScriptEscape='true'/>",	    	    
	    "confirmation.items.save": 										"<spring:message code='confirmation.items.save' javaScriptEscape='true'/>",	    	    
	    "confirmation.inspection.decomposition": 						"<spring:message code='confirmation.inspection.decomposition' javaScriptEscape='true'/>",	    	    
	    "confirmation.inspection.modal.close": 							"<spring:message code='confirmation.inspection.modal.close' javaScriptEscape='true'/>",	    	    
	    
	    // SUCCESS
	    "success.password.change": 										"<spring:message code='success.password.change' javaScriptEscape='true'/>",	    	    
	    "success.permission.save": 										"<spring:message code='success.permission.save' javaScriptEscape='true'/>",	    	    
	    "success.user.delete": 											"<spring:message code='success.user.delete' javaScriptEscape='true'/>",	    	    
	    "success.user.registration": 									"<spring:message code='success.user.registration' javaScriptEscape='true'/>",	    	    
	    "success.user.registered.pendingPermission": 					"<spring:message code='success.user.registered.pendingPermission' javaScriptEscape='true'/>",	    	    
	    "success.user.registered.withExistingPermission": 				"<spring:message code='success.user.registered.withExistingPermission' javaScriptEscape='true'/>",	    	    
	    "success.user.update": 											"<spring:message code='success.user.update' javaScriptEscape='true'/>",	    	    
	    "message.interface.completed"	: 								"<spring:message code='message.interface.completed' javaScriptEscape='true'/>",		
	    "success.barcode.delete"	: 									"<spring:message code='success.barcode.delete' javaScriptEscape='true'/>",			
	    "success.data.save"	: 											"<spring:message code='success.data.save' javaScriptEscape='true'/>"			
	  });
</script>