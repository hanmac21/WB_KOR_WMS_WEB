<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<script>
	window.I18N = Object.assign(window.I18N || Object.create(null), {
	    "btn.access.insert" : 			"<spring:message code='btn.access.insert'  javaScriptEscape='true'/>",
	    "btn.access.changepassword" : 	"<spring:message code='btn.access.changepassword'  javaScriptEscape='true'/>",
	    "btn.access.delete" : 			"<spring:message code='btn.access.delete'  javaScriptEscape='true'/>",
	    "btn.user.update" : 			"<spring:message code='btn.user.update'  javaScriptEscape='true'/>",
	    "btn.access.block" : 			"<spring:message code='btn.access.block'  javaScriptEscape='true'/>",
	    "btn.access.enable" : 			"<spring:message code='btn.access.enable'  javaScriptEscape='true'/>",
	    "btn.access.factory.edit": 		"<spring:message code='btn.access.factory.edit' javaScriptEscape='true'/>",
	    "btn.addNew" : 					"<spring:message code='btn.addNew'  javaScriptEscape='true'/>",
	    "btn.cancel" : 					"<spring:message code='btn.cancel'  javaScriptEscape='true'/>",
	    "btn.clear" : 					"<spring:message code='btn.clear'  javaScriptEscape='true'/>",
	    "btn.delete" : 					"<spring:message code='btn.delete'  javaScriptEscape='true'/>",
	    "btn.edit" : 					"<spring:message code='btn.edit'  javaScriptEscape='true'/>",
	    "btn.exceptionOut" : 			"<spring:message code='btn.exceptionOut'  javaScriptEscape='true'/>",
	    "btn.inbound.register" : 		"<spring:message code='btn.inbound.register'  javaScriptEscape='true'/>",
	    "btn.inbound.cancel" : 			"<spring:message code='btn.inbound.cancel'  javaScriptEscape='true'/>",
	    "btn.issue" : 					"<spring:message code='btn.issue'  javaScriptEscape='true'/>",
	    "btn.issue.all" :				"<spring:message code='btn.issue.all'  javaScriptEscape='true'/>",
	    "btn.logout": 					"<spring:message code='btn.logout' javaScriptEscape='true'/>",
	    "btn.outbound.register": 		"<spring:message code='btn.outbound.register' javaScriptEscape='true'/>",
	    "btn.print" : 					"<spring:message code='btn.print'  javaScriptEscape='true'/>",
	    "btn.reIssue" :					"<spring:message code='btn.reIssue'  javaScriptEscape='true'/>",
	    "btn.save": 					"<spring:message code='btn.save' javaScriptEscape='true'/>",
	    "btn.search": 					"<spring:message code='btn.search' javaScriptEscape='true'/>",
	    "btn.workMove.cancel": 			"<spring:message code='btn.workMove.cancel' javaScriptEscape='true'/>",
	    "btn.workMove.release": 		"<spring:message code='btn.workMove.release' javaScriptEscape='true'/>",
	    "btn.Intf": 					"<spring:message code='btn.Intf' javaScriptEscape='true'/>",
	    "btn.Intf.delete": 				"<spring:message code='btn.Intf.delete' javaScriptEscape='true'/>",
	    "btn.inbound.btnIntf": 			"<spring:message code='btn.inbound.btnIntf' javaScriptEscape='true'/>",
	    "btn.inbound.btnIntf.delete": 	"<spring:message code='btn.inbound.btnIntf.delete' javaScriptEscape='true'/>",
	    "btn.access.depart": 			"<spring:message code='btn.access.depart' javaScriptEscape='true'/>",
	    "btn.access.factory": 			"<spring:message code='btn.access.factory' javaScriptEscape='true'/>",
	    "btn.access.permission": 		"<spring:message code='btn.access.permission' javaScriptEscape='true'/>",
	    "btn.closed": 					"<spring:message code='btn.closed' javaScriptEscape='true'/>",
	    "btn.judge": 					"<spring:message code='btn.judge' javaScriptEscape='true'/>",
	    "btn.create": 					"<spring:message code='btn.create' javaScriptEscape='true'/>"
	});
	
  (function(){
    'use strict';
    const I = window.I18N || Object.create(null); 
    window.I18N = I;   

    function t(key, def){ return (I[key] ?? def ?? key); }
    function tf(key, ...args){ return t(key, key).replace(/\{(\d+)\}/g,(m,i)=>(args[i] ?? m)); }

    Object.freeze(I);
    window.i18n = { t, tf };
  })();
</script>