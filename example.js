/// <reference path="../Scripts/jquery-2.1.0-vsdoc.js" />
/// <reference path="../Scripts/jquery-2.1.4.js" />
/// <reference path="../Scripts/jquery-2.1.4.intellisense.js" />
/// <reference path="myReportGeneratorFunctions.js" />
/// <reference path="../DataTables-1.10.1/media/js/jquery.dataTables.js" />
/**
* @class  garmentProduct 
* @param {String} strName Defines the name of the Garment Product itself
* @param {Array} arrAttributes Defines the set of attributes that would need to be pulled from the Garment Product itself for headers etc or just for general display but for which no linkage is created
* @param {Array} arrSpecs an array of the specs that are in the garment product
* @param {Array} arrSources an array of the Sources that are in the garment product
* @param {Object} objColorwayProduct The linked Colorway Product Object.  Later a corresponding Class May be Created
* @param {Object} objPatternProduct The linked Pattern Product Object.  Later a corresponding Class May be Created
* @param {Object} objLabelProduct The linked Label Product Object.  Later a corresponding Class May be Created
* @param {Object} objSellingProduct The linked Selling Product Object.  Later a corresponding Class May be Created
* @param {Array} arrBoms an array of the BOMs that are in the garment product, these will and should be paired down to only be those coming from the active spec
* @param {Array} arrSeasonSourceSpecCombos an array of viable combinations of season/source/spec
* @param {Array} arrDocuments an array of the doucments that are in the garment product
* @param {Object} objMeasurement an object containing the branch id and objectId of the LCSMeasurement class, does not contain the individual POMs etc et at this point in this object
* @param {Object} objConstruction an object containing the branch id and objectId of the LCSConstruction class, does not contain the individual POMs etc et at this point in this object
* @param {String} strObjectId a string denoting the objecId of the LCSProduct that is the garment product
* @param {Object} objGSpec an object container for the active garment spec
* @param {Object} objPSpec an object container for the active pattern spec
* @param {Array} arrBase64Documents not sure yet if will be used
* @param {Array} arrConstructionInfo not sure yet if will be used
* @param {Object} objconstructionDetail container for the individual poms of objConstruction
* @param {Object} objMeasurementDetail container for the individual poms of objMeasurement
* @param {String} strSpecId a string denoting the objectId of the LCSFlexSpecification which is the active spec
*
*/
function garmentProduct(strName, arrAttributes, arrSpecs, arrSources, objColorwayProduct, objPatternProduct, objLabelProduct, objSellingProduct, arrBoms, arrSeasonSourceSpecCombos, arrDocuments, objMeasurement, objConstruction, strObjectId, objGSpec, objPSpec, arrBase64Documents, arrConstructionInfo, objconstructionDetail, objMeasurementDetail, strSpecId) {
    this.specs = arrSpecs;
    this.attributes = arrAttributes;
    this.name = strName;
    this.sources = arrSources;
    this.colorwayProduct = objColorwayProduct;
    this.patternProduct = objPatternProduct;
    this.labelProduct = objLabelProduct;
    this.sellingProduct = objSellingProduct;
    this.boms = arrBoms;
    this.seasonSourceSpecCombos = arrSeasonSourceSpecCombos;
    this.documents = arrDocuments;
    this.measurement = objMeasurement;
    this.measurementDetail = objMeasurementDetail;
    this.construction = objConstruction;
    this.constructionInfo = arrConstructionInfo;
    this.constructionDetail = objconstructionDetail;
    this.objectId = strObjectId;
    this.currentGarmentSpec = objGSpec;
    this.currentPatternSpec = objPSpec;
    this.activeSpecId = strSpecId;
    this.base64DocumentArray = arrBase64Documents;
    this.garmentDoc = new jsPDF('landscape');

};
/**
 * @method of @class GarmentProduct, should take existing elements of the garment product and produce a pdf using the
 * jsPdf Library
 *
 */
garmentProduct.prototype.savePDF = function () {
    this.garmentDoc.text('Colorway Product:   ' + this.colorwayProduct.name, 0, 40);
    this.garmentDoc.text('Pattern Product:  ' + this.patternProduct.name, 0, 80);
    this.garmentDoc.save(this.name + '.pdf');

};
/**
 * @method of @class GarmentProduct
 * @param {String} strHostUrlPrefix string denoting the initial characters of the url for the domain in which the measurement sits.  All string prior to Windchill.
 * @param {Number} numConstructionBranchId takes the branch id from objConstruction (preferrably) and then turns constructionDetail of the garmentProduct which runs this to contain all the POMs etc.
 *
 */
garmentProduct.prototype.getMyConstruction = function (strHostUrlPrefix, numConstructionBranchId) {
    var strTaskUrl = strHostUrlPrefix + 'Windchill/servlet/IE/tasks/com/lcs/wc/construction/FindConstructionInfo.xml'; //?oid=VR:com.lcs.wc.construction.LCSConstructionInfo:' + numConstructionBranchId + '&instance=net.hbi.res.wsflexappprd1v.windchillAdapter';
    var arrCurrentConstruction = [];
    //uncomment this for test runs offline
    if (location.protocol == 'file:') {
        //strTaskUrl = 'dataSetSamples/findConstructions2.xml'
    };
    //
    $.ajax({
        url: strTaskUrl,
        type: 'get',
        data: {
            oid: 'VR:com.lcs.wc.construction.LCSConstructionInfo:' + numConstructionBranchId,
            instance: 'net.hbi.res.wsflexappprd1v.windchillAdapter'
        },
        async: true

    }).done(function (data) {
        //this each should be used to iterate through the data response and create the structure required for the report
        //for the later garment product/pdf

        var objCurrentRow = {};
        //namespace is harder to grab so just grabbing the parant element of the first element and then iterating through those
        // need to change this later to correctly use the namespace but, working for now.
        $('id', data).parent().find('*').each(function () {
            var objCurrentElement = $(this);
            if (objCurrentElement.is("id")) {
                //push the current object to the array and nuke the current object
                objCurrentRow.id = objCurrentElement.text();
            }
            else if (objCurrentElement.is("sortingNumber")) {
                objCurrentRow.sortingNumber = objCurrentElement.text();
            }
            else if (objCurrentElement.is("IDA2A2")) {
                objCurrentRow.IDA2A2 = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiLooperThread")) {
                objCurrentRow.hbiLooperThread = objCurrentElement.text();
            }
            else if (objCurrentElement.is("libraryItemReference")) {
                objCurrentRow.libraryItemReference = objCurrentElement.text();
            }
            else if (objCurrentElement.is("detailImage")) {
                objCurrentRow.detailImage = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiGarmentUse")) {
                objCurrentRow.hbiGarmentUse = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiGarmentUseDisplay")) {
                objCurrentRow.hbiGarmentUseDisplay = objCurrentElement.text();
            }
            else if (objCurrentElement.is("constructionPart")) {
                objCurrentRow.constructionPart = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiNeedleColor")) {
                objCurrentRow.hbiNeedleColor = objCurrentElement.text();
            }
            else if (objCurrentElement.is("stitching")) {
                objCurrentRow.stitching = objCurrentElement.text();
            }
            else if (objCurrentElement.is("stitchingDisplay")) {
                objCurrentRow.stitchingDisplay = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiSpi")) {
                objCurrentRow.hbiSpi = objCurrentElement.text();
            }
            else if (objCurrentElement.is("comments")) {
                objCurrentRow.comments = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiGuageWidth")) {
                objCurrentRow.hbiGuageWidth = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiLooperColor")) {
                objCurrentRow.hbiLooperColor = objCurrentElement.text();
            }
            else if (objCurrentElement.is("hbiNeedleThread")) {
                objCurrentRow.hbiNeedleThread = objCurrentElement.text();
            }
            else if (objCurrentElement.is("number")) {
                objCurrentRow.number = objCurrentElement.text();
            }
            else if (objCurrentElement.is("instruction")) {
                objCurrentRow.instruction = objCurrentElement.text();
            }
            else if (objCurrentElement.is("constructionPartDetail")) {
                objCurrentRow.constructionPartDetail = objCurrentElement.text();
            }
            else if (objCurrentElement.is("topStitch")) {
                objCurrentRow.topStitch = objCurrentElement.text();
            }
            else if (objCurrentElement.is("topStitchDisplay")) {
                objCurrentRow.topStitchDisplay = objCurrentElement.text();
            }
            else if (objCurrentElement.is("seamType")) {
                objCurrentRow.seamType = objCurrentElement.text();
            }
            else if (objCurrentElement.is("seamTypeDisplay")) {
                objCurrentRow.seamTypeDisplay = objCurrentElement.text();
                arrCurrentConstruction.push(objCurrentRow)
                objCurrentRow = {};
            }

        });
        // and so on for each element that we want to capture
    });
    // and so on for each element that we want to capture
    this.constructionDetail = arrCurrentConstruction;
    console.log(this);
    console.dir(this);
    //alert(objGarmentProductToModify.construction.constructionData);


};
/**
    Still need to add logic here to deal with size variation and variable columns as a result.
 * @method of @class GarmentProduct
 * @param {String} strHostUrlPrefix string denoting the initial characters of the url for the domain in which the measurement sits.  All string prior to Windchill.
 * @param {Number} numMeasurementBranchId takes the branch id from objMeasurement (preferrably) and then turns measurementDetail of the garmentProduct which runs this to contain all the POMs etc.
 *
 */
garmentProduct.prototype.getMyMeasurement = function (strHostUrlPrefix, numMeasurementBranchId) {
    //http://wsflexwebprd1v.res.hbi.net/Windchill/servlet/IE/tasks/com/lcs/wc/measurements/FindMeasurements.xml?oid=VR:com.lcs.wc.measurements.LCSMeasurements:2394285&instance=net.hbi.res.wsflexappprd1v.windchillAdapter
    var strTaskUrl = strHostUrlPrefix + 'Windchill/servlet/IE/tasks/com/lcs/wc/measurements/FindMeasurements.xml'; //?oid=VR:com.lcs.wc.construction.LCSConstructionInfo:' + numConstructionBranchId + '&instance=net.hbi.res.wsflexappprd1v.windchillAdapter';
    var arrCurrentMeasurement = [];
    //uncomment this for test runs offline
    if (location.protocol == 'file:') {
        strTaskUrl = 'dataSetSamples/FindMeasurements.xml'
    };
    //
    $.ajax({
        url: strTaskUrl,
        type: 'get',
        data: {
            oid: 'VR:com.lcs.wc.measurements.LCSMeasurements:' + numMeasurementBranchId,
            instance: 'net.hbi.res.wsflexappprd1v.windchillAdapter'
        },
        async: true

    }).done(function (data) {
        $('wc\\:INSTANCE', data).each(function () {
            var objRow = {};
            objRow.id = $(this).find('id ').text();
            objRow.sortingNumber = $(this).find('sortingNumber ').text();
            objRow.name = $(this).find('name ').text();
            objRow.point1 = $(this).find('point1 ').text();
            objRow.point2 = $(this).find('point2 ').text();
            objRow.plusTolerance = $(this).find('plusTolerance ').text();
            objRow.plusTolerance = $(this).find('plusTolerance ').text();
            objRow.minusTolerance = $(this).find('minusTolerance ').text();
            objRow.minusTolerance = $(this).find('minusTolerance ').text();
            objRow.IDA2A2 = $(this).find('IDA2A2').text();
            objRow.pointsOfMeasureType = $(this).find('pointsOfMeasureType').text();
            objRow.effectSequence = $(this).find('effectSequence ').text();
            objRow.hbiPatternPiece = $(this).find('hbiPatternPiece ').text();
            objRow.placementAmount = $(this).find('placementAmount ').text();
            objRow.actualMeasurement = $(this).find('actualMeasurement ').text();
            objRow.Illustration = $(this).find('Illustration ').text();
            objRow.measurementName = $(this).find('measurementName').text();
            objRow.section = $(this).find('section ').text();
            objRow.hbiGradeCode = $(this).find('hbiGradeCode').text();
            objRow.hbiPiecesPerGarment = $(this).find('hbiPiecesPerGarment ').text();
            objRow.htmInstruction = $(this).find('htmInstruction ').text();
            objRow.quotedMeasurementDelta = $(this).find('quotedMeasurementDelta ').text();
            objRow.number = $(this).find('number').text();
            objRow.criticalPom = $(this).find('criticalPom ').text();
            objRow.libraryItemReference = $(this).find('libraryItemReference').text();
            objRow.howToMeasure = $(this).find('howToMeasure').text();
            objRow.placementReference = $(this).find('placementReference').text();
            objRow.actualMeasurementDelta = $(this).find('actualMeasurementDelta ').text();
            objRow.requestedMeasurement = $(this).find('requestedMeasurement ').text();
            objRow.newMeasurement = $(this).find('newMeasurement ').text();
            objRow.sampleMeasurementComments = $(this).find('sampleMeasurementComments ').text();
            objRow.quotedMeasurement = $(this).find('quotedMeasurement ').text();
            objRow.highLight = $(this).find('highLight ').text();
            objRow.placeholderRow = $(this).find('placeholderRow ').text();
            arrCurrentMeasurement.push(objRow);
        });

    });
    this.measurementDetail = arrCurrentMeasurement;
}
/**
 * @method of @class GarmentProduct, this method returns the active spec and identifies it on the objSelfReference garment and alters that property.
 * @param {String} strHostUrlPrefix string denoting the initial characters of the url for the domain in which the measurement sits.  All string prior to Windchill.
 * @param {String} strGarmentName uses the name of the garmentProduct that is calling this method
 * @param {Function} funCallback passes a function to callback after the modification of the garmentProduct being passed to this function
 * @param {Object} objForCallback provides a container for the callback function to operate on to pass into the objSelfReference object.  This is used to work around scope limitations.
 * @param {Object} objSelfReference takes the same garmentProduct which is calling the method.  This is used to work around scope limitations and is generally performed
 * without further developer input but rather in other methods within the class so that no further code is necessary.
 *
 */
garmentProduct.prototype.getSpecByName = function (strHostUrlPrefix, strGarmentName, funCallback, objForCallback, objSelfReference) {
    var strSpecUrl = strHostUrlPrefix + 'Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?Product+Name=' + strGarmentName + '&oid=OR%3Awt.query.template.ReportTemplate%3A9663785&action=ExecuteReport';
    var numActiveSpecId = 0;
    var arrSpecArray = [];
    var arrSourceArray = [];
    var arrCombinationArray = [];
    var gProdName = '';
    $.get(strSpecUrl, function (specData) { }).done(function (specData) {
        $('row', specData).each(function () {
            gProdName = $(this).find('Garment_product_Name').first().text();
            var objSpec = {};
            objSpec.name = $(this).find('Spec_Name').text();
            objSpec.idNumber = $(this).find('specLink').attr('objectId');
            //http://wsflexwebprd1v.res.hbi.net/Windchill/servlet/TypeBasedIncludeServlet?oid=VR%3Acom.lcs.wc.specification.FlexSpecification%3A5532945&u8=1
            var strSpecName = $(this).find('Spec_Name').text();
            var strType = $(this).find('specLink').attr('type');
            var strHbiActiveSpec = $(this).find('hbiActiveSpec').text().substring(3, 6);

            if (strSpecName.indexOf(strHbiActiveSpec) == -1) {
                objSpec.active = false;
            }
            else {
                objSpec.active = true;
                numActiveSpecId = objSpec.idNumber;
            };
            var strId = objSpec.idNumber;
            var strReturnString = strLinkBeginTag + strTypeBaseLink + strType + strEncodeColonString + strId + strU8 + strLinkMidTag + strSpecName + strLinkCloseTag;
            objSpec.link = strReturnString
            arrSpecArray.push(objSpec);
            //moving to building products sources from the specs
            var objSource = {};
            objSource.name = $(this).find('Sourcing_Config_Name').text();
            objSource.idNumber = $(this).find('LCSSourcingConfig').attr('objectId');
            strType = $(this).find('LCSSourcingConfig').attr('type');
            strId = objSource.idNumber
            strReturnString = strLinkBeginTag + strTypeBaseLink + strType + strEncodeColonString + strId + strU8 + strLinkMidTag + strSpecName + strLinkCloseTag;
            objSource.link = strReturnString;
            var strPrimary = $(this).find('Primary_Source').text();
            objSource.primary = strPrimary == 1 ? true : false;
            arrSourceArray.push(objSource);
            //show viable combinations
            var objCombinationObject = {};
            objCombinationObject.sourceId = objSource.idNumber;
            objCombinationObject.sourceName = objSource.name;
            objCombinationObject.specId = objSpec.idNumber;
            objCombinationObject.specName = objSpec.name;
            objCombinationObject.seasonId = $(this).find('Garment_Season').attr('objectId');
            objCombinationObject.seasonName = $(this).find('Garment_Season_Season_Name').text();
            //objCombinationObject.seasonSpecCombo = "Season:" + objCombinationObject.seasonName + "_Spec:" + objCombinationObject.specName
            //trying this without season and spec literals to reduce button size
            objCombinationObject.seasonSpecCombo = "" + objCombinationObject.seasonName + " _src_" + objCombinationObject.sourceName + " _spec_" + objCombinationObject.specName
            arrCombinationArray.push(objCombinationObject);
        });
        arrSpecArray.reverse();
        arrSourceArray.reverse();
        arrCombinationArray.reverse();
        objForCallback = { arrSpecArray: arrSpecArray, arrSourceArray: arrSourceArray, arrCombinationArray: arrCombinationArray, activeSpecId: numActiveSpecId, gProdName: gProdName };
        funCallback(objForCallback, objSelfReference);

    });

    //this.specs = arrSpecArray;
    //this.sources = arrSourceArray;
    //this.seasonSourceSpecCombos = arrCombinationArray;
    //this.activeSpecId = numActiveSpecId;
    //this.getAllMyDataForMyActiveSpec(strHostUrlPrefix, this.activeSpecId);
    //var objSelfReference = this;
    /*for (var i = 0; i < objSelfReference.specs.length; i++) {
        if (objSelfReference.specs[i].active) {
            objSelfReference.activeSpecId = objSelfReference.specs[i].idNumber;
            //getSpecComponentsForActiveSpec(this.specs[i].id, hostUrlPrefix, this);
            objSelfReference.getAllMyDataForMyActiveSpec(strHostUrlPrefix, objSelfReference.activeSpecId);

        };
    };*/

};
/**
 * @method of @class GarmentProduct, this method gets all spec components for the active spec of the garment for which is passed.  It is run as a deffered call nested within the @method getAllMyDataForMyActiveSpec within @class garmentProduct
 * @param {String} strHostUrlPrefix string denoting the initial characters of the url for the domain in which the measurement sits.  All string prior to Windchill.
 * @param {Object} objDocumentData defferred object that is passed to this function to work around the asynchronous nature of the ajax calls.  It contains all data pertaining to the object between 'obj' and 'Data' in its name
 * @param {Object} objConstructionData defferred object that is passed to this function to work around the asynchronous nature of the ajax calls.  It contains all data pertaining to the object between 'obj' and 'Data' in its name
 * @param {Object} objMeasurementData defferred object that is passed to this function to work around the asynchronous nature of the ajax calls.  It contains all data pertaining to the object between 'obj' and 'Data' in its name
 * @param {Object} objBomData defferred object that is passed to this function to work around the asynchronous nature of the ajax calls.  It contains all data pertaining to the object between 'obj' and 'Data' in its name
 * @param {Object} objProdLinkData defferred object that is passed to this function to work around the asynchronous nature of the ajax calls.  It contains all data pertaining to the object between 'obj' and 'Data' in its name
 */
garmentProduct.prototype.getSpecComponentsForActiveSpec = function (strHostUrlPrefix, objDocumentData, objConstructionData, objMeasurementData, objBomData, objProdLinkData) {

    var arrDocuments = [];
    var arrBoms = [];
    var arrTableDataArray = [];
    var objColorwayProduct = {};
    var objPatternProduct = {};
    var objGarmentProduct = {};
    var objLabelProduct = {};
    var objSellingProduct = {};
    var strProdName = '';
    var numObjectId;
    //first pass here determines product relationships
    $('row', objProdLinkData).each(function (index) {
        var linkedProductType = $(this).find('linkedProductType').text();
        var objLinkedProduct = {};
        strProdName = $(this).find('garmentProductName').first().text();
        numObjectId = $(this).find('garmentProductName').first().attr('objectId');
        objLinkedProduct.name = $(this).find('linkedProductName').text();
        objLinkedProduct.objectId = $(this).find('linkedProductName').attr('objectId');
        objLinkedProduct.branchId = $(this).find('linkedProductName').attr('branchId');

        if (linkedProductType == "BASIC CUT & SEW - COLORWAY") {
            objLinkedProduct.type = "Colorway Product";
            objColorwayProduct = objLinkedProduct;
            //objSelfReference.colorwayProduct = objLinkedProduct;
        }
        else if (linkedProductType == "BASIC CUT & SEW - PATTERN") {
            objLinkedProduct.type = "Pattern Product";
            objPatternProduct = objLinkedProduct;
            //objSelfReference.patternProduct = objLinkedProduct;
        }
        else if (linkedProductType == "LABEL") {
            objLinkedProduct.type = "Label Product";
            objLabelProduct = objLinkedProduct;
            //objSelfReference.laeblProduct = objLinkedProduct;

        }
        else if (linkedProductType == "BASIC CUT & SEW - SELLING") {
            objLinkedProduct.type = "Selling Product";
            objSellingProduct = objLinkedProduct;
            //objSelfReference.sellingProduct = objLinkedProduct;

        };



    });

    this.name = strProdName;
    this.objectId = numObjectId;
    this.colorwayProduct = objColorwayProduct;
    this.patternProduct = objPatternProduct;
    this.labelProduct = objLabelProduct;
    this.sellingProduct = objSellingProduct;

    $('row', objDocumentData).each(function () {
        var strImgViewerPrefix1 = strHostUrlPrefix + 'Windchill/rfa/jsp/image/ImageViewer.jsp?imageUrl=&appDataOid=OR:wt.content.ApplicationData:';
        var strImgViewerPrefix2 = '&contentHolderOid=OR:com.lcs.wc.document.LCSDocument:';
        //this will need to be changed to http protocl once migrated
        var strImgViewerPrefix3 = "file://res.hbi.net/dfs/BrandedApparel/Activewear/FlexApp/Prod/";
        //Above URL is for testing when using a file protocl offline, switching below to dev http url
        //this will need to be changed to http protocl once migrated
        //dev version of URL
        //var strImgViewerPrefix3 = "http://res.hbi.net/dfs/BrandedApparel/Activewear/FlexApp/Prod/";
        var name = $(this).find('Document_Master_Name').text();
        var strpSpecId = $(this).find('patternSpecId').text();
        var strgSpecId = $(this).find('garmentSpecId').text();
        var strCompSpecId = $(this).find('comRefSpecId').text();
        if ($(this).is('row:first')) {
            var objGSpec = {};
            var objPSpec = {};
            objGSpec.currentGarmentSpecId = $(this).find('garmentSpecId').text();
            objPSpec.currentGarmentSpecId = $(this).find('patternSpecId').text();
            objGSpec.name = $(this).find('gSpecName').text();
            objPSpec.name = $(this).find('pSpecName').text();
            //objSelfReference.currentGarmentSpec = objGSpec;
            //objSelfReference.currentGarmentSpec = objPSpec;
            //this.currentGarmentSpec = objGSpec;
            //this.currentPatternSpec = objPSpec;

        };
        //console.log(name);
        objComponent = {};
        objComponent.name = name;
        objComponent.componentType = 'Document';
        objComponent.masterId = $(this).find('Document_Master').attr('objectId');
        objComponent.documentType = $(this).find('Component_Type').text();
        objComponent.fileName = $(this).find('fileName').text();
        objComponent.vaultFileName = $(this).find('fileNameOnVault').text();
        objComponent.fullVaultUrl = strImgViewerPrefix3 + objComponent.vaultFileName;
        objComponent.seqeuence = $(this).find('Unique_Sequence_Number').text();
        objComponent.imgSrcUrl = objComponent.seqeuence + " " + objComponent.fileName;
        objComponent.dataUri = 'initial value';
        objComponent.description = $(this).find('Description').text();
        var strStartPointSubString = objComponent.description.substring(11, objComponent.description.length);
        var numLengthStartPoint = strStartPointSubString.search('x') + 1;
        var numNumCharsOfWidth = numLengthStartPoint - 1;
        var numWidth = strStartPointSubString.substring(0, numNumCharsOfWidth);
        var numLength = strStartPointSubString.substring(numLengthStartPoint, strStartPointSubString.length);
        objComponent.width = numWidth;
        objComponent.height = numLength;
        var roleA = $(this).find('roleAObjectRef_key_id').text();
        var roleB = $(this).find('roleBObjectRef_key_id').text();
        //objComponent.iframe = '<div class="item"><img width="' + objComponent.width + '" height="' + objComponent.height + '" class="hideIframe" src="' + strImgViewerPrefix1 + roleB + strImgViewerPrefix2 + roleA + '" border="1"></img></div>';
        convertImgToBase64(strImgViewerPrefix3 + objComponent.vaultFileName, function (base64Img) {
            //console.log('IMAGE:', base64Img);
            objComponent.dataUri = 'IMAGE:', base64Img;

        });
        //objComponent.image = '<div class="item" <h2>' + objComponent.name + '-' + objComponent.fileName + '</h2></br><img width="' + objComponent.width + '" height="' + objComponent.length + '" class="img-responsive hideImg" src="' + strImgViewerPrefix3 + objComponent.vaultFileName + '" /></div>';
        objComponent.imageUrl = '<img width="' + objComponent.width + '" height="' + objComponent.length + '" class="img-responsive" src="' + objComponent.fullVaultUrl + '" />';
        //objComponent.image = '<div class="item" <h2>' + objComponent.name + '-' + objComponent.fileName + '</h2></br><img width="800" height="800" src="' + strImgViewerPrefix3 + objComponent.vaultFileName + '" /></div>';
        //later will change this to img in order to test it.



        if (strpSpecId == strCompSpecId) {
            objComponent.ownerType = 'Pattern';
        }
        else {
            objComponent.ownerType = 'Garment';
        };

        arrDocuments.push(objComponent);
        arrTableDataArray.push(objComponent);
    });
    this.documents = arrDocuments;
    var objMeasurementComp = {};
    $('row', objMeasurementData).each(function () {
        var name = $(this).find('Measurements_Name').text();
        //console.log(name);
        objMeasurementComp = {};
        objMeasurementComp.name = name;
        objMeasurementComp.componentType = 'Measurement';
        objMeasurementComp.ownerType = 'Pattern';
        objMeasurementComp.fileName = "";
        objMeasurementComp.imageUrl = "<img src='' />";
        objMeasurementComp.branchForTask = $(this).find('branchIdForTaskCall').text();
        //this.measurement = objComponent;
        //arrTableDataArray.push(objComponent);
    });
    this.measurement = objMeasurementComp;
    var objConstructionComp = {};
    $('row', objConstructionData).each(function () {
        var name = $(this).find('Construction_Info_Name').text();
        //console.log(name);
        objConstructionComp = {};
        objConstructionComp.name = name;
        objConstructionComp.componentType = 'Construction';
        objConstructionComp.ownerType = 'Pattern';
        objConstructionComp.fileName = "";
        objConstructionComp.imageUrl = "<img src='' />";
        objConstructionComp.branchId = $(this).find('branchIdForTask').text();

        //this.construction = objComponent;


    });
    this.construction = objConstructionComp;
    $('row', objBomData).each(function () {
        var name = $(this).find('com_lcs_wc_flexbom_FlexBOMPart_Name').text();
        var strpBomSpecId = $(this).find('pSpecId').text();
        var strgBomSpecId = $(this).find('gSpecId').text();
        var strBomCompSpecId = $(this).find('comRefSpecId').text();
        var strFlexBomType = $(this).find('Flex_Type_Type_Name').text();
        //console.log(name);
        objBomComponent = {};
        objBomComponent.name = name;
        objBomComponent.fileName = "";
        objBomComponent.componentType = 'BOM';
        objBomComponent.imageUrl = "<img src='' />";
        objBomComponent.flexType = strFlexBomType;

        var regPprod = new RegExp("Pattern");
        var regGprod = new RegExp("Garment");
        if (regPprod.test(strFlexBomType)) {
            objBomComponent.ownerType = 'Pattern';
        }
        else if (regGprod.test(strFlexBomType)) {
            objBomComponent.ownerType = 'Garment';
        };


        arrTableDataArray.push(objBomComponent);
        arrBoms.push(objBomComponent);

    });
    this.boms = arrBoms;
    //this.boms = arrBoms;
    //createRelatedProductsDiv(objSelfReference);


};
/**
 * @method of @class GarmentProduct, this method runs a sequence of ajax calls to get all necessary data sets for running @method getSpecComponentsForActiveSpec, then it sequentially calls them
 * @param {String} strHostUrlPrefix string denoting the initial characters of the url for the domain in which the measurement sits.  All string prior to Windchill.
 * @param {Object} strSpecId objectId of active LCSFlexSpecification
 * @param {Object} objSelfReference takes the same garmentProduct which is calling the method.  This is used to work around scope limitations and is generally performed
 */
garmentProduct.prototype.getAllMyDataForMyActiveSpec = function (strHostUrlPrefix, strSpecId, objSelfReference) {
    var strSpecGetUrl = strHostUrlPrefix + "Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gstrSpecId=" + strSpecId + "&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A9999594&action=ExecuteReport"
    var strDocumentsUrl = strHostUrlPrefix + "Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gstrSpecId=" + strSpecId + "&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A9996723&action=ExecuteReport";
    var strMeasurementsUrl = strHostUrlPrefix + "Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gstrSpecId=" + strSpecId + "&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A9953962&action=ExecuteReport";
    console.log(strMeasurementsUrl);
    var strConstructionsUrl = strHostUrlPrefix + "Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gstrSpecId=" + strSpecId + "&garmentProductName=" + this.name + "&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A10343155&action=ExecuteReport";
    console.log(strConstructionsUrl);
    var strBomsUrl = strHostUrlPrefix + "Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gstrSpecId=" + strSpecId + "&garmentProductName=" + this.name + "&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A9953826&action=ExecuteReport";
    var strConTaskUrl = strHostUrlPrefix + 'Windchill/servlet/IE/tasks/com/lcs/wc/construction/FindConstructionInfo.xml'; //?oid=VR:com.lcs.wc.construction.LCSConstructionInfo:' + numConstructionBranchId + '&instance=net.hbi.res.wsflexappprd1v.windchillAdapter';
    var strGetColorwayPatternUrl = strHostUrlPrefix + 'Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gProd=' + currentGarmentProduct.name + '&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A10430767&action=ExecuteReport';

    var arrDocumentData = $.ajax({
        url: strDocumentsUrl,
        type: 'get'

    });

    var arrMeasData = $.ajax({
        url: strMeasurementsUrl,
        type: 'get'

    });

    var arrConstructionData = $.ajax({
        url: strConstructionsUrl,
        type: 'get'

    });

    var arrBomData = $.ajax({
        url: strBomsUrl,
        type: 'get'

    });
    var arrProdLinkData = $.ajax({
        url: strGetColorwayPatternUrl,
        type: 'get'

    });
    var objDocData = {};
    var objConData = {};
    var objMeasData = {};
    var objBomData = {};
    var objProdLinkData = {};

    //var garment = this;
    $.when(arrDocumentData, arrConstructionData, arrMeasData, arrBomData, arrProdLinkData).done(function (arrDocumentData, arrConstructionData, arrMeasData, arrBomData, arrProdLinkData) {
        //currentGarmentProdToModify.getSpecComponentsForActiveSpec(arrDocumentData[0], arrConstructionData[0], arrMeasData[0], arrBomData[0]);
        objDocData = arrDocumentData[0];
        objConData = arrConstructionData[0];
        objMeasData = arrMeasData[0];
        objBomData = arrBomData[0];
        objProdLinkData = arrProdLinkData[0];
        console.log(objDocData, objConData, objMeasData, objBomData, arrProdLinkData);
        objSelfReference.getSpecComponentsForActiveSpec(strHostUrlPrefix, objDocData, objConData, objMeasData, objBomData, objProdLinkData);
        console.log(objSelfReference);
        objSelfReference.generateAvailableReportsList(objSelfReference);
    });

    //this.getSpecComponentsForActiveSpec(objDocData, objConData, objMeasData, objBomData);


};
//not using, will double check
/**
 * @method of @class GarmentProduct, this method runs a sequence of ajax calls to get all necessary data sets for running @method getSpecComponentsForActiveSpec, then it sequentially calls them
 * @param {String} strHostUrlPrefix string denoting the initial characters of the url for the domain in which the measurement sits.  All string prior to Windchill.
 * @param {Object} objSelfReference takes the same garmentProduct which is calling the method.  This is used to work around scope limitations and is generally performed
 */
//not using, will double check
garmentProduct.prototype.processGarmentSpecs = function (strHostUrlPrefix, objSelfReference) {
    //this.name = $('Garment_product_Name', specData).first().text();
    //moved the above to relationship function
    // not needed herevar strGetColorwayPatternUrl = strHostUrlPrefix + 'Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gProd=' + this.name + '&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A9990008&action=ExecuteReport';
    var strGetSpecDataUrl = strHostUrlPrefix + 'Windchill/servlet/WindchillAuthGW/wt.enterprise.URLProcessor/URLTemplateAction?gProd=' + this.name + '&format=formatDelegate&delegateName=XML&xsl1=&xsl2=&oid=OR%3Awt.query.template.ReportTemplate%3A9990008&action=ExecuteReport';
    if (location.protocol == 'file:') {
        strGetSpecDataUrl = 'dataSetSamples/garmentProdToGarmentSpecs.xml';
    };

    var arrSpecArray = [];
    var arrSourceArray = [];
    var arrCombinationArray = [];
    $.get(strGetSpecDataUrl, function () { }).done(function (specData) {
        $('row', specData).each(function () {
            var objSpec = {};
            objSpec.name = $(this).find('Spec_Name').text();
            objSpec.idNumber = $(this).find('specLink').attr('objectId');
            //http://wsflexwebprd1v.res.hbi.net/Windchill/servlet/TypeBasedIncludeServlet?oid=VR%3Acom.lcs.wc.specification.FlexSpecification%3A5532945&u8=1
            var strSpecName = $(this).find('Spec_Name').text();
            var strType = $(this).find('specLink').attr('type');
            var strHbiActiveSpec = $(this).find('hbiActiveSpec').text().substring(3, 6);

            if (strSpecName.indexOf(strHbiActiveSpec) == -1) {
                objSpec.active = false;
            }
            else {
                objSpec.active = true;
            };
            var strId = objSpec.idNumber;
            var strReturnString = strLinkBeginTag + strTypeBaseLink + strType + strEncodeColonString + strId + strU8 + strLinkMidTag + strSpecName + strLinkCloseTag;
            objSpec.link = strReturnString
            arrSpecArray.push(objSpec);
            //moving to building products sources from the specs
            var objSource = {};
            objSource.name = $(this).find('Sourcing_Config_Name').text();
            objSource.idNumber = $(this).find('LCSSourcingConfig').attr('objectId');
            strType = $(this).find('LCSSourcingConfig').attr('type');
            strId = objSource.idNumber
            strReturnString = strLinkBeginTag + strTypeBaseLink + strType + strEncodeColonString + strId + strU8 + strLinkMidTag + strSpecName + strLinkCloseTag;
            objSource.link = strReturnString;
            var strPrimary = $(this).find('Primary_Source').text();
            objSource.primary = strPrimary == 1 ? true : false;
            arrSourceArray.push(objSource);
            //show viable combinations
            var objCombinationObject = {};
            objCombinationObject.sourceId = objSource.idNumber;
            objCombinationObject.sourceName = objSource.name;
            objCombinationObject.specId = objSpec.idNumber;
            objCombinationObject.specName = objSpec.name;
            objCombinationObject.seasonId = $(this).find('Garment_Season').attr('objectId');
            objCombinationObject.seasonName = $(this).find('Garment_Season_Season_Name').text();
            //objCombinationObject.seasonSpecCombo = "Season:" + objCombinationObject.seasonName + "_Spec:" + objCombinationObject.specName
            //trying this without season and spec literals to reduce button size
            objCombinationObject.seasonSpecCombo = "" + objCombinationObject.seasonName + " _src_" + objCombinationObject.sourceName + " _spec_" + objCombinationObject.specName
            arrCombinationArray.push(objCombinationObject);
        });
        arrSpecArray.reverse();
        arrSourceArray.reverse();
        arrCombinationArray.reverse();
        objSelfReference.specs = arrSpecArray;
        objSelfReference.sources = arrSourceArray;
        objSelfReference.seasonSourceSpecCombos = arrCombinationArray;

        //This is where you need to add in getSpecComps for activeSpec 
        for (var i = 0; i < objSelfReference.specs.length; i++) {
            if (objSelfReference.specs[i].active) {
                objSelfReference.activeSpecId = objSelfReference.specs[i].idNumber;
                //getSpecComponentsForActiveSpec(this.specs[i].id, hostUrlPrefix, this);

            };
        };

    });
    objSelfReference = this;
    objSelfReference.getSpecComponentsForActiveSpec(strHostUrlPrefix, this);
};
/**
 * @method of @class GarmentProduct, this method runs as a callback to finalize the population of the garmentProduct class
 * @param {Object} objectForCallback Object container passed in callbkac
 * @param {Object} objSelfReference takes the same garmentProduct which is calling the method.  This is used to work around scope limitations and is generally performed
 */
garmentProduct.prototype.thenCallSpecs = function (objectForCallback, objSelfReference) {
    objSelfReference.specs = objectForCallback.arrSpecArray
    objSelfReference.sources = objectForCallback.arrSourceArray
    objSelfReference.seasonSourceSpecCombos = objectForCallback.arrCombinationArray
    objSelfReference.activeSpecId = objectForCallback.activeSpecId;
    objSelfReference.name = objectForCallback.gProdName;
    objSelfReference.getAllMyDataForMyActiveSpec(strUrlPrefix, objSelfReference.activeSpecId, objSelfReference);
};
/**
 * @method of @class GarmentProduct, this method runs to determine, based on available spec components in the objSelfReference, what are the available report sets that 
 * could be used.  Currently it is only invoked as a callback.
 * @param {Object} objSelfReference takes the same garmentProduct which is calling the method.  This is used to work around scope limitations and is generally performed
 */
garmentProduct.prototype.generateAvailableReportsList = function (objSelfReference) {
    $('#reportsHeader *').remove();
    $('#reportsHeader').append('<table cellpadding="0" cellspacing="0" border="0" class="display responsive" id="reports"><thead><th>Sort Order</th><th>Report</th><th>Name</th></thead><tbody></tbody></table>');
    var reportTable = $('#reports').DataTable({
        'pageLength': 5,
        'dom': 'plrtip',
        "columnDefs": [
            {
                "targets": [0],
                "visible": false,
                "searchable": false
            }
        ]

    });
    // later will need to add here a few documents that we want to exclude intentionally
    // like front back images that come from pattern products
    var sortOrder = 0;

    if (typeof (objSelfReference.construction) != 'undefined') { reportTable.row.add([sortOrder, 'Construction', objSelfReference.construction.name]); sortOrder++; };
    if (typeof (objSelfReference.measurement) != 'undefined') { reportTable.row.add([sortOrder, 'Measurements', objSelfReference.measurement.name]); sortOrder++; };
    if (typeof (objSelfReference.boms != 'undefined')) {
        var arrBoms = objSelfReference.boms;
        var boolHaveGarmentCut = false;
        var boolHavePatternSpread = false;
        var boolHavePatternTrimStraight = false;
        var boolHavePatternTrimBias = false;
        for (var i = 0; i < arrBoms.length; i++) {
            var strBomType = arrBoms[i].flexType;
            if (strBomType == 'Pattern Product Trim Bias BOM') { boolHavePatternTrimBias = true; }
            if (strBomType == 'Garment Cut') { boolHaveGarmentCut = true; }
            if (strBomType == 'Pattern Product Trim Straight BOM') { boolHavePatternTrimStraight = true; }
            if (strBomType == 'Pattern Product Spread BOM') { boolHavePatternSpread = true; }
        };
        if (boolHaveGarmentCut && boolHavePatternSpread && boolHavePatternTrimStraight && boolHavePatternTrimBias) {
            reportTable.row.add([sortOrder, 'Block Weights Report', 'Spread, Trim Straight and Trim Bias']);
            sortOrder++;
        }
        else if (boolHaveGarmentCut && boolHavePatternSpread && boolHavePatternTrimStraight) {
            reportTable.row.add([sortOrder, 'Block Weights Report', 'Spread and Trim Straight']);
            sortOrder++;
        }
        else if (boolHaveGarmentCut && boolHavePatternSpread && boolHavePatternTrimBias) {
            reportTable.row.add([sortOrder, 'Block Weights Report', 'Spread and Trim Bias']);
            sortOrder++;
        }
        else if (boolHaveGarmentCut && boolHavePatternSpread) {
            reportTable.row.add([sortOrder, 'Block Weights Report', 'Spread']);
            sortOrder++;
        }
    };

    if (typeof (objSelfReference.documents != 'undefined')) {
        var arrdocs = objSelfReference.documents;
        for (i = 0; i < arrdocs.length; i++) {
            reportTable.row.add([sortOrder, arrdocs[i].name, arrdocs[i].imageUrl]);
            sortOrder++;
        };

    };
    createRelatedProductsDiv(objSelfReference);
    reportTable.draw();


};
