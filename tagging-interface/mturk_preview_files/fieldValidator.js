
// SuperClass Validator. All validation classes should be children of this.

function Validator() {
    // All child classes know to call init. This empty constructor is needed for the inheritence.
}
Validator.errorVisibleStyle = "error-message-error-wrapper";
Validator.errorHiddenStyle = "error-message-none-wrapper";
Validator.fieldHighlightedStyle = "question-error-wrapper";
Validator.fieldNormalStyle = "";
Validator.prototype.init = function(fieldName, errorFieldName) {
    this.fieldName = fieldName; 
    this.errorFieldName = errorFieldName;
    
    this.fieldElement = document.getElementById(this.fieldName); 
    this.errorElement = document.getElementById(this.errorFieldName);
}
Validator.prototype.validateField = function() {
  if(this.validateFieldHelper() == 1) {
    this.showErrorField();
    return 1;
  } else {
    this.hideErrorField();
    return 0;
  }
}
Validator.prototype.validateFieldHelper = function() {
    this.showErrorField();
    this.showFieldBorder();
    return 1; // fail everytime -- e.g., this is "abstract".
}
// Toggle a string within the class="" tag so that the style of the element changes.
// This is done this way because onblur can actually happen multiple times, so this
// is a uniform way to prevent the same class from being in the string multiple times.
Validator.prototype.toggleClassStyle = function(element, oldClassStyle, newClassStyle) {
    if (element != null) {
        var newClassName = element.className;
        
        if(oldClassStyle != "") {
            var oldRegex = new RegExp(" *" + oldClassStyle,"");
            while (oldRegex.test(newClassName)) {
                newClassName = newClassName.replace(oldRegex,"");
            }
        }
        
        if(newClassStyle != "") {
            var newRegex = new RegExp(" *" + newClassStyle);
            if(!newRegex.test(newClassName)) {
                newClassName = newClassName + " " + newClassStyle;
            }
        }

        element.className = newClassName;
    }
}
Validator.prototype.hideErrorField = function() {
    this.toggleClassStyle(this.errorElement,Validator.errorVisibleStyle,Validator.errorHiddenStyle);
}
Validator.prototype.showErrorField = function() {
    this.toggleClassStyle(this.errorElement,Validator.errorHiddenStyle,Validator.errorVisibleStyle);
}
Validator.prototype.hideFieldBorder = function() {
    this.toggleClassStyle(this.fieldElement,Validator.fieldHighlightedStyle,Validator.fieldNormalStyle);
}
Validator.prototype.showFieldBorder = function() {
    this.toggleClassStyle(this.fieldElement,Validator.fieldNormalStyle,Validator.fieldHighlightedStyle);
}

// And this is the RegexValidator (AnswerFormat constraint)

function RegexValidator(fieldName, errorFieldName, encodedRegex, flags) {
    this.init(fieldName, errorFieldName, encodedRegex, flags);
}
RegexValidator.prototype = new Validator();
RegexValidator.prototype.init = function(fieldName, errorFieldName, encodedRegex, flags) {
    Validator.prototype.init.call(this, fieldName, errorFieldName);
    this.regex = new RegExp(encodedRegex, flags);
}
RegexValidator.prototype.validateFieldHelper = function() {
    if ( !(this.regex.test(this.fieldElement.value)) && (this.fieldElement.value != '')) {
        return 1;
    }
    
    return 0;
} 

// Validate answer length (Length constraint)

// If you have a minLength set, it also implies IsRequired. This is the legacy definition
// that is defined in the MTurk UI.
// If you want an optional entry that has a minimum length defined, use a regex constraint.
// This regex would be "^(|.*{minLength,})$" which says that either blank or at least minLength
// characters. There is also "^(|.*{minLength,maxLength})$"

function LengthValidator(fieldName, errorFieldName, minLength, maxLength) {
    this.init(fieldName, errorFieldName, minLength, maxLength);
}
LengthValidator.prototype = new Validator();
LengthValidator.prototype.init = function(fieldName, errorFieldName, minLength, maxLength) {
    Validator.prototype.init.call(this,fieldName,errorFieldName);
    this.minLength = minLength;
    this.maxLength = maxLength;
}
LengthValidator.prototype.validateFieldHelper = function() {
    if( (this.minLength >= 0) && (this.fieldElement.value.length < this.minLength) ) {
        return 1;
    }
    if( (this.maxLength > 0) && (this.fieldElement.value.length > this.maxLength) ) {
        return 1;
    }

    return 0;
}

// Validate that the numeric value is within a certain range (Numeric Constraint)
// The MTurk.com UI defines that if IsNumeric is set, a value must be entered. If the
// numeric field is optional then a regex could be used. An example regex would be
// "^(|[-+]?[0-9]+\.?[0-9]*(E[-+][0-9]+)?)$" which will allow any float.

function NumericValidator(fieldName, errorFieldName, minValue, maxValue) {
    this.init(fieldName, errorFieldName, minValue, maxValue);
}
NumericValidator.prototype = new Validator();
NumericValidator.prototype.init = function(fieldName, errorFieldName, minValue, maxValue) {
    Validator.prototype.init.call(this,fieldName,errorFieldName);

    if(minValue != '' && maxValue != '' && minValue > maxValue) {
        // min > max? Swap them as we store them!
        this.minValue = maxValue;
        this.maxValue = minValue;
    } else {
        // correct order, store them as is.
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
}
NumericValidator.prototype.validateFieldHelper = function() {
    if( (this.fieldElement.value.length > 0) ) {
        if( isNaN(this.fieldElement.value) ) {
            return 1;
        }

        if( (this.minValue != '') && (this.fieldElement.value < this.minValue) ) {
            return 1;
        }
        if( (this.maxValue != '') && (this.fieldElement.value > this.maxValue) ) {
            return 1;
        }
    } else {
        // IsNumeric also means IsRequired! For an optional numeric, use a regex ^[0-9]*$
        return 1;
    }
    return 0;
}

// IsRequired Constraint.

function TextIsRequiredValidator(fieldName, errorFieldName) {
    this.init(fieldName, errorFieldName);
}
TextIsRequiredValidator.prototype = new Validator();
TextIsRequiredValidator.prototype.init = function(fieldName, errorFieldName) {
    Validator.prototype.init.call(this,fieldName,errorFieldName);
}
TextIsRequiredValidator.prototype.validateFieldHelper = function() {
    if(this.fieldElement.value.length == 0) {
        return 1;
    }
    return 0;
}

// Each input field is associated with a list of validator objects.

function ValidationList(fieldName) {
    this.fieldName = fieldName;
    this.list = new Array();
}
ValidationList.prototype.addEntry = function(value) {
    if(typeof value != "undefined") {
        this.list[this.list.length] = value;
    }
}
ValidationList.prototype.checkAll = function() {
    if(this.list.length == 0) {
        return; // nothing to do
    }

    var errCnt;
    errCnt = 0;
  
    for(var k = 0;k < this.list.length;k++) {
        errCnt += this.list[k].validateField();
    }

    if(errCnt > 0) {
        // at least one error. show the red border around the field.
        this.list[0].showFieldBorder();
    } else {
        this.list[0].hideFieldBorder();
    }

    return errCnt;
}

// And this keeps track of all the fields

function FieldList() {
    this.list = new Array();
}
FieldList.prototype.getField = function(fieldName) {
    for (var k = 0;k < this.list.length;k++) {
        if (this.list[k].fieldName == fieldName) {
            return this.list[k];
        }
    }

    return "";
}
FieldList.prototype.addField = function(validator) {
    if(typeof validator != "undefined"  ) {
        validatorList = this.getField(validator.fieldName);
  
        if(validatorList == "") { // not already present
            validatorList = new ValidationList(validator.fieldName);
            this.list.push(validatorList);
        }
        validatorList.addEntry(validator);
        
        // The other thing to do, for consistency sake is to set this field's error message as hidden
        validator.hideErrorField();
        validator.hideFieldBorder();
    }
}
FieldList.prototype.validateField = function(element) {
    fieldName = element.name;

    fieldList = this.getField(fieldName);
    if(fieldList != "") {
        return fieldList.checkAll();
    } else {
        return 0;
    }
}
FieldList.prototype.validateAll = function() {
    allErrCnt = 0;

    for(var k = 0;k < this.list.length ; k++) {
        allErrCnt += this.list[k].checkAll();
    }

    if(allErrCnt > 0) {
        var alertString = "You have ";
        if(allErrCnt == 1) {
            alertString += "1 error. Please correct it";
        } else {
            alertString += allErrCnt + " errors. Please correct them";
        } 
        alertString += " and try to submit your answers again."
        alert(alertString);
        return false;
    } else {
        return true; // allow submit to finish
    }
}

globalFieldList = new FieldList();

