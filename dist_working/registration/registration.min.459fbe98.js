"use strict";

function getWatchers(element) {
    var elementToWatch = element ? angular.element(element) : angular.element(document.getElementsByTagName("body")),
        watchers = [],
        f = function(element) {
            angular.forEach(["$scope", "$isolateScope"], function(scopeProperty) {
                element.data() && element.data().hasOwnProperty(scopeProperty) && angular.forEach(element.data()[scopeProperty].$$watchers, function(watcher) {
                    watchers.push(watcher)
                })
            }), angular.forEach(element.children(), function(childElement) {
                f(angular.element(childElement))
            })
        };
    f(elementToWatch);
    var watchersWithoutDuplicates = [];
    return angular.forEach(watchers, function(item) {
        watchersWithoutDuplicates.indexOf(item) < 0 && watchersWithoutDuplicates.push(item)
    }), console.log(watchersWithoutDuplicates), watchersWithoutDuplicates
}
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {},
    function() {
        var hostUrl = localStorage.getItem("host") ? "https://" + localStorage.getItem("host") : "",
            rootDir = localStorage.getItem("rootDir") || "",
            RESTWS = hostUrl + "/openmrs/ws/rest",
            RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1",
            BAHMNI_CORE = RESTWS_V1 + "/bahmnicore",
            EMRAPI = RESTWS + "/emrapi",
            BACTERIOLOGY = RESTWS_V1,
            BASE_URL = hostUrl + "/bahmni_config/openmrs/apps/",
            CUSTOM_URL = hostUrl + "/implementation_config/openmrs/apps/",
            serverErrorMessages = [{
                serverMessage: "Cannot have more than one active order for the same orderable and care setting at same time",
                clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
            }, {
                serverMessage: "[Order.cannot.have.more.than.one]",
                clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
            }],
            representation = "custom:(uuid,name,names,conceptClass,setMembers:(uuid,name,names,conceptClass,setMembers:(uuid,name,names,conceptClass,setMembers:(uuid,name,names,conceptClass))))",
            unAuthenticatedReferenceDataMap = {
                "/openmrs/ws/rest/v1/location?tags=Login+Location&s=byTags&v=default": "LoginLocations",
                "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=locale.allowed.list": "LocaleList"
            },
            authenticatedReferenceDataMap = {
                "/openmrs/ws/rest/v1/idgen/identifiertype": "IdentifierTypes",
                "/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form": "AddressHierarchyLevels",
                "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=mrs.genders": "Genders",
                "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.encountersession.duration": "encounterSessionDuration",
                "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.relationshipTypeMap": "RelationshipTypeMap",
                "/openmrs/ws/rest/v1/bahmnicore/config/bahmniencounter?callerContext=REGISTRATION_CONCEPTS": "RegistrationConcepts",
                "/openmrs/ws/rest/v1/relationshiptype?v=custom:(aIsToB,bIsToA,uuid)": "RelationshipType",
                "/openmrs/ws/rest/v1/personattributetype?v=custom:(uuid,name,sortWeight,description,format,concept)": "PersonAttributeType",
                "/openmrs/ws/rest/v1/entitymapping?mappingType=loginlocation_visittype&s=byEntityAndMappingType": "LoginLocationToVisitTypeMapping",
                "/openmrs/ws/rest/v1/bahmnicore/config/patient": "PatientConfig",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Consultation+Note&v=custom:(uuid,name,answers)": "ConsultationNote",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Lab+Order+Notes&v=custom:(uuid,name)": "LabOrderNotes",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Impression&v=custom:(uuid,name)": "RadiologyImpressionConfig",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=All_Tests_and_Panels&v=custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))": "AllTestsAndPanelsConcept",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Dosage+Frequency&v=custom:(uuid,name,answers)": "DosageFrequencyConfig",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Dosage+Instructions&v=custom:(uuid,name,answers)": "DosageInstructionConfig",
                "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.encounterType.default": "DefaultEncounterType",
                "/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Stopped+Order+Reason&v=custom:(uuid,name,answers)": "StoppedOrderReasonConfig",
                "/openmrs/ws/rest/v1/ordertype": "OrderType",
                "/openmrs/ws/rest/v1/bahmnicore/config/drugOrders": "DrugOrderConfig",
                "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=drugOrder.drugOther": "NonCodedDrugConcept"
            };
        authenticatedReferenceDataMap["/openmrs/ws/rest/v1/entitymapping?mappingType=location_encountertype&s=byEntityAndMappingType&entityUuid=" + (localStorage.getItem("LoginInformation") ? JSON.parse(localStorage.getItem("LoginInformation")).currentLocation.uuid : "")] = "LoginLocationToEncounterTypeMapping", Bahmni.Common.Constants = {
            hostURL: hostUrl,
            dateFormat: "dd/mm/yyyy",
            dateDisplayFormat: "DD-MMM-YYYY",
            timeDisplayFormat: "hh:mm",
            emrapiDiagnosisUrl: EMRAPI + "/diagnosis",
            bahmniDiagnosisUrl: BAHMNI_CORE + "/diagnosis/search",
            bahmniDeleteDiagnosisUrl: BAHMNI_CORE + "/diagnosis/delete",
            diseaseTemplateUrl: BAHMNI_CORE + "/diseaseTemplates",
            AllDiseaseTemplateUrl: BAHMNI_CORE + "/diseaseTemplate",
            emrapiConceptUrl: EMRAPI + "/concept",
            encounterConfigurationUrl: BAHMNI_CORE + "/config/bahmniencounter",
            patientConfigurationUrl: BAHMNI_CORE + "/config/patient",
            drugOrderConfigurationUrl: BAHMNI_CORE + "/config/drugOrders",
            emrEncounterUrl: EMRAPI + "/encounter",
            encounterUrl: RESTWS_V1 + "/encounter",
            locationUrl: RESTWS_V1 + "/location",
            bahmniVisitLocationUrl: BAHMNI_CORE + "/visitLocation",
            bahmniOrderUrl: BAHMNI_CORE + "/orders",
            bahmniDrugOrderUrl: BAHMNI_CORE + "/drugOrders",
            bahmniDispositionByVisitUrl: BAHMNI_CORE + "/disposition/visit",
            bahmniDispositionByPatientUrl: BAHMNI_CORE + "/disposition/patient",
            bahmniSearchUrl: BAHMNI_CORE + "/search",
            bahmniLabOrderResultsUrl: BAHMNI_CORE + "/labOrderResults",
            bahmniEncounterUrl: BAHMNI_CORE + "/bahmniencounter",
            conceptUrl: RESTWS_V1 + "/concept",
            bahmniConceptAnswerUrl: RESTWS_V1 + "/bahmniconceptanswer",
            conceptSearchByFullNameUrl: RESTWS_V1 + "/concept?s=byFullySpecifiedName",
            visitUrl: RESTWS_V1 + "/visit",
            endVisitUrl: BAHMNI_CORE + "/visit/endVisit",
            changeVisit: BAHMNI_CORE + "/visit/updateVisit",
            endVisitAndCreateEncounterUrl: BAHMNI_CORE + "/visit/endVisitAndCreateEncounter",
            visitTypeUrl: RESTWS_V1 + "/visittype",
            patientImageUrlByPatientUuid: RESTWS_V1 + "/patientImage?patientUuid=",
            labResultUploadedFileNameUrl: "/uploaded_results/",
            visitSummaryUrl: BAHMNI_CORE + "/visit/summary",
            encounterModifierUrl: BAHMNI_CORE + "/bahmniencountermodifier",
            openmrsUrl: hostUrl + "/openmrs",
            loggingUrl: hostUrl + "/log/",
            idgenConfigurationURL: RESTWS_V1 + "/idgen/identifiertype",
            bahmniRESTBaseURL: BAHMNI_CORE + "",
            observationsUrl: BAHMNI_CORE + "/observations",
            obsRelationshipUrl: BAHMNI_CORE + "/obsrelationships",
            encounterImportUrl: BAHMNI_CORE + "/admin/upload/encounter",
            programImportUrl: BAHMNI_CORE + "/admin/upload/program",
            conceptImportUrl: BAHMNI_CORE + "/admin/upload/concept",
            conceptSetImportUrl: BAHMNI_CORE + "/admin/upload/conceptset",
            drugImportUrl: BAHMNI_CORE + "/admin/upload/drug",
            labResultsImportUrl: BAHMNI_CORE + "/admin/upload/labResults",
            referenceTermsImportUrl: BAHMNI_CORE + "/admin/upload/referenceterms",
            updateReferenceTermsImportUrl: BAHMNI_CORE + "/admin/upload/referenceterms/new",
            relationshipImportUrl: BAHMNI_CORE + "/admin/upload/relationship",
            conceptSetExportUrl: BAHMNI_CORE + "/admin/export/conceptset?conceptName=:conceptName",
            patientImportUrl: BAHMNI_CORE + "/admin/upload/patient",
            adminImportStatusUrl: BAHMNI_CORE + "/admin/upload/status",
            programUrl: RESTWS_V1 + "/program",
            programEnrollPatientUrl: RESTWS_V1 + "/bahmniprogramenrollment",
            programStateDeletionUrl: RESTWS_V1 + "/programenrollment",
            programEnrollmentDefaultInformation: "default",
            programEnrollmentFullInformation: "full",
            programAttributeTypes: RESTWS_V1 + "/programattributetype",
            relationshipTypesUrl: RESTWS_V1 + "/relationshiptype",
            personAttributeTypeUrl: RESTWS_V1 + "/personattributetype",
            diseaseSummaryPivotUrl: BAHMNI_CORE + "/diseaseSummaryData",
            allTestsAndPanelsConceptName: "All_Tests_and_Panels",
            dosageFrequencyConceptName: "Dosage Frequency",
            dosageInstructionConceptName: "Dosage Instructions",
            stoppedOrderReasonConceptName: "Stopped Order Reason",
            consultationNoteConceptName: "Consultation Note",
            diagnosisConceptSet: "Diagnosis Concept Set",
            radiologyOrderType: "Radiology Order",
            radiologyResultConceptName: "Radiology Result",
            investigationEncounterType: "INVESTIGATION",
            validationNotesEncounterType: "VALIDATION NOTES",
            labOrderNotesConcept: "Lab Order Notes",
            impressionConcept: "Impression",
            qualifiedByRelationshipType: "qualified-by",
            dispositionConcept: "Disposition",
            dispositionGroupConcept: "Disposition Set",
            dispositionNoteConcept: "Disposition Note",
            ruledOutDiagnosisConceptName: "Ruled Out Diagnosis",
            emrapiConceptMappingSource: "org.openmrs.module.emrapi",
            abbreviationConceptMappingSource: "Abbreviation",
            includeAllObservations: !1,
            openmrsObsUrl: RESTWS_V1 + "/obs",
            openmrsObsRepresentation: "custom:(uuid,obsDatetime,value:(uuid,name:(uuid,name)))",
            admissionCode: "ADMIT",
            dischargeCode: "DISCHARGE",
            transferCode: "TRANSFER",
            undoDischargeCode: "UNDO_DISCHARGE",
            vitalsConceptName: "Vitals",
            heightConceptName: "HEIGHT",
            weightConceptName: "WEIGHT",
            bmiConceptName: "BMI",
            bmiStatusConceptName: "BMI STATUS",
            abnormalObservationConceptName: "IS_ABNORMAL",
            documentsPath: "/document_images",
            documentsConceptName: "Document",
            miscConceptClassName: "Misc",
            abnormalConceptClassName: "Abnormal",
            unknownConceptClassName: "Unknown",
            durationConceptClassName: "Duration",
            conceptDetailsClassName: "Concept Details",
            admissionEncounterTypeName: "ADMISSION",
            dischargeEncounterTypeName: "DISCHARGE",
            imageClassName: "Image",
            videoClassName: "Video",
            locationCookieName: "bahmni.user.location",
            retrospectiveEntryEncounterDateCookieName: "bahmni.clinical.retrospectiveEncounterDate",
            JSESSIONID: "JSESSIONID",
            rootScopeRetrospectiveEntry: "retrospectiveEntry.encounterDate",
            patientFileConceptName: "Patient file",
            serverErrorMessages: serverErrorMessages,
            currentUser: "bahmni.user",
            retrospectivePrivilege: "app:clinical:retrospective",
            locationPickerPrivilege: "app:clinical:locationpicker",
            onBehalfOfPrivilege: "app:clinical:onbehalf",
            nutritionalConceptName: "Nutritional Values",
            messageForNoObservation: "NO_OBSERVATIONS_CAPTURED",
            messageForNoDisposition: "NO_DISPOSTIONS_AVAILABLE_MESSAGE_KEY",
            messageForNoFulfillment: "NO_FULFILMENT_MESSAGE",
            reportsUrl: "/bahmnireports",
            uploadReportTemplateUrl: "/bahmnireports/upload",
            ruledOutdiagnosisStatus: "Ruled Out Diagnosis",
            registartionConsultationPrivilege: "app:common:registration_consultation_link",
            manageIdentifierSequencePrivilege: "Manage Identifier Sequence",
            closeVisitPrivilege: "app:common:closeVisit",
            deleteDiagnosisPrivilege: "app:clinical:deleteDiagnosis",
            viewPatientsPrivilege: "View Patients",
            editPatientsPrivilege: "Edit Patients",
            addVisitsPrivilege: "Add Visits",
            deleteVisitsPrivilege: "Delete Visits",
            grantProviderAccess: "app:clinical:grantProviderAccess",
            grantProviderAccessDataCookieName: "app.clinical.grantProviderAccessData",
            globalPropertyUrl: BAHMNI_CORE + "/sql/globalproperty",
            passwordPolicyUrl: BAHMNI_CORE + "/globalProperty/passwordPolicyProperties",
            fulfillmentConfiguration: "fulfillment",
            fulfillmentFormSuffix: " Fulfillment Form",
            noNavigationLinksMessage: "NO_NAVIGATION_LINKS_AVAILABLE_MESSAGE",
            conceptSetRepresentationForOrderFulfillmentConfig: representation,
            entityMappingUrl: RESTWS_V1 + "/entitymapping",
            encounterTypeUrl: RESTWS_V1 + "/encountertype",
            defaultExtensionName: "default",
            orderSetMemberAttributeTypeUrl: RESTWS_V1 + "/ordersetmemberattributetype",
            orderSetUrl: RESTWS_V1 + "/bahmniorderset",
            primaryOrderSetMemberAttributeTypeName: "Primary",
            bahmniBacteriologyResultsUrl: BACTERIOLOGY + "/specimen",
            bedFromVisit: RESTWS_V1 + "/beds",
            ordersUrl: RESTWS_V1 + "/order",
            formDataUrl: RESTWS_V1 + "/obs",
            providerUrl: RESTWS_V1 + "/provider",
            drugUrl: RESTWS_V1 + "/drug",
            orderTypeUrl: RESTWS_V1 + "/ordertype",
            userUrl: RESTWS_V1 + "/user",
            passwordUrl: RESTWS_V1 + "/password",
            formUrl: RESTWS_V1 + "/form",
            allFormsUrl: RESTWS_V1 + "/bahmniie/form/allForms",
            latestPublishedForms: RESTWS_V1 + "/bahmniie/form/latestPublishedForms",
            formTranslationsUrl: RESTWS_V1 + "/bahmniie/form/translations",
            sqlUrl: BAHMNI_CORE + "/sql",
            patientAttributeDateFieldFormat: "org.openmrs.util.AttributableDate",
            platform: "user.platform",
            RESTWS_V1: RESTWS_V1,
            baseUrl: BASE_URL,
            customUrl: CUSTOM_URL,
            faviconUrl: hostUrl + "/bahmni/favicon.ico",
            platformType: {
                other: "other"
            },
            numericDataType: "Numeric",
            encryptionType: {
                SHA3: "SHA3"
            },
            LoginInformation: "LoginInformation",
            ServerDateTimeFormat: "YYYY-MM-DDTHH:mm:ssZZ",
            calculateDose: BAHMNI_CORE + "/calculateDose",
            unAuthenticatedReferenceDataMap: unAuthenticatedReferenceDataMap,
            authenticatedReferenceDataMap: authenticatedReferenceDataMap,
            rootDir: rootDir,
            dischargeUrl: BAHMNI_CORE + "/discharge",
            uuidRegex: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            eventlogFilterUrl: hostUrl + "/openmrs/ws/rest/v1/eventlog/filter",
            bahmniConnectMetaDataDb: "metaData",
            serverDateTimeUrl: "/cgi-bin/systemdate",
            loginText: "/bahmni_config/openmrs/apps/home/whiteLabel.json",
            auditLogUrl: RESTWS_V1 + "/auditlog",
            appointmentServiceUrl: RESTWS_V1 + "/appointmentService",
            conditionUrl: EMRAPI + "/condition",
            conditionHistoryUrl: EMRAPI + "/conditionhistory",
            followUpConditionConcept: "Follow-up Condition",
            localeLangs: "/bahmni_config/openmrs/apps/home/locale_languages.json",
            privilegeRequiredErrorMessage: "PRIVILEGE_REQUIRED",
            patientFormsUrl: BAHMNI_CORE + "/patient/{patientUuid}/forms",
            defaultPossibleRelativeSearchLimit: 10,
            formBuilderDisplayControlType: "formsV2",
            formBuilderType: "v2"
        }
    }(),
    function() {
        function n(n, t) {
            return n.set(t[0], t[1]), n
        }

        function t(n, t) {
            return n.add(t), n
        }

        function r(n, t, r) {
            switch (r.length) {
                case 0:
                    return n.call(t);
                case 1:
                    return n.call(t, r[0]);
                case 2:
                    return n.call(t, r[0], r[1]);
                case 3:
                    return n.call(t, r[0], r[1], r[2])
            }
            return n.apply(t, r)
        }

        function e(n, t, r, e) {
            for (var u = -1, o = n.length; ++u < o;) {
                var i = n[u];
                t(e, i, r(i), n)
            }
            return e
        }

        function u(n, t) {
            for (var r = -1, e = n.length; ++r < e && !1 !== t(n[r], r, n););
            return n
        }

        function o(n, t) {
            for (var r = -1, e = n.length; ++r < e;)
                if (!t(n[r], r, n)) return !1;
            return !0
        }

        function i(n, t) {
            for (var r = -1, e = n.length, u = -1, o = []; ++r < e;) {
                var i = n[r];
                t(i, r, n) && (o[++u] = i)
            }
            return o
        }

        function f(n, t) {
            return !!n.length && -1 < d(n, t, 0)
        }

        function c(n, t, r) {
            for (var e = -1, u = n.length; ++e < u;)
                if (r(t, n[e])) return !0;
            return !1
        }

        function a(n, t) {
            for (var r = -1, e = n.length, u = Array(e); ++r < e;) u[r] = t(n[r], r, n);
            return u
        }

        function l(n, t) {
            for (var r = -1, e = t.length, u = n.length; ++r < e;) n[u + r] = t[r];
            return n
        }

        function s(n, t, r, e) {
            var u = -1,
                o = n.length;
            for (e && o && (r = n[++u]); ++u < o;) r = t(r, n[u], u, n);
            return r
        }

        function h(n, t, r, e) {
            var u = n.length;
            for (e && u && (r = n[--u]); u--;) r = t(r, n[u], u, n);
            return r
        }

        function p(n, t) {
            for (var r = -1, e = n.length; ++r < e;)
                if (t(n[r], r, n)) return !0;
            return !1
        }

        function _(n, t, r) {
            for (var e = -1, u = n.length; ++e < u;) {
                var o = n[e],
                    i = t(o);
                if (null != i && (f === Z ? i === i : r(i, f))) var f = i,
                    c = o
            }
            return c
        }

        function g(n, t, r, e) {
            var u;
            return r(n, function(n, r, o) {
                return t(n, r, o) ? (u = e ? r : n, !1) : void 0
            }), u
        }

        function v(n, t, r) {
            for (var e = n.length, u = r ? e : -1; r ? u-- : ++u < e;)
                if (t(n[u], u, n)) return u;
            return -1
        }

        function d(n, t, r) {
            if (t !== t) return B(n, r);
            --r;
            for (var e = n.length; ++r < e;)
                if (n[r] === t) return r;
            return -1
        }

        function y(n, t, r, e, u) {
            return u(n, function(n, u, o) {
                r = e ? (e = !1, n) : t(r, n, u, o)
            }), r
        }

        function b(n, t) {
            var r = n.length;
            for (n.sort(t); r--;) n[r] = n[r].c;
            return n
        }

        function x(n, t) {
            for (var r, e = -1, u = n.length; ++e < u;) {
                var o = t(n[e]);
                o !== Z && (r = r === Z ? o : r + o)
            }
            return r
        }

        function j(n, t) {
            for (var r = -1, e = Array(n); ++r < n;) e[r] = t(r);
            return e
        }

        function m(n, t) {
            return a(t, function(t) {
                return [t, n[t]]
            })
        }

        function w(n) {
            return function(t) {
                return n(t)
            }
        }

        function A(n, t) {
            return a(t, function(t) {
                return n[t]
            })
        }

        function O(n, t) {
            for (var r = -1, e = n.length; ++r < e && -1 < d(t, n[r], 0););
            return r
        }

        function k(n, t) {
            for (var r = n.length; r-- && -1 < d(t, n[r], 0););
            return r
        }

        function E(n) {
            return n && n.Object === Object ? n : null
        }

        function I(n, t) {
            if (n !== t) {
                var r = null === n,
                    e = n === Z,
                    u = n === n,
                    o = null === t,
                    i = t === Z,
                    f = t === t;
                if (n > t && !o || !u || r && !i && f || e && f) return 1;
                if (t > n && !r || !f || o && !e && u || i && u) return -1
            }
            return 0
        }

        function S(n) {
            return Un[n]
        }

        function R(n) {
            return zn[n]
        }

        function W(n) {
            return "\\" + $n[n]
        }

        function B(n, t, r) {
            var e = n.length;
            for (t += r ? 0 : -1; r ? t-- : ++t < e;) {
                var u = n[t];
                if (u !== u) return t
            }
            return -1
        }

        function C(n) {
            var t = !1;
            if (null != n && "function" != typeof n.toString) try {
                t = !!(n + "")
            } catch (r) {}
            return t
        }

        function U(n, t) {
            return n = "number" == typeof n || yn.test(n) ? +n : -1, n > -1 && 0 == n % 1 && (null == t ? 9007199254740991 : t) > n
        }

        function z(n) {
            for (var t, r = []; !(t = n.next()).done;) r.push(t.value);
            return r
        }

        function M(n) {
            var t = -1,
                r = Array(n.size);
            return n.forEach(function(n, e) {
                r[++t] = [e, n]
            }), r
        }

        function L(n, t) {
            for (var r = -1, e = n.length, u = -1, o = []; ++r < e;) n[r] === t && (n[r] = "__lodash_placeholder__", o[++u] = r);
            return o
        }

        function $(n) {
            var t = -1,
                r = Array(n.size);
            return n.forEach(function(n) {
                r[++t] = n
            }), r
        }

        function F(n) {
            if (!n || !En.test(n)) return n.length;
            for (var t = kn.lastIndex = 0; kn.test(n);) t++;
            return t
        }

        function N(n) {
            return Mn[n]
        }

        function D(E) {
            function yn(n) {
                if (je(n) && !No(n) && !(n instanceof An)) {
                    if (n instanceof wn) return n;
                    if (cu.call(n, "__wrapped__")) return Zr(n)
                }
                return new wn(n)
            }

            function mn() {}

            function wn(n, t) {
                this.__wrapped__ = n, this.__actions__ = [], this.__chain__ = !!t, this.__index__ = 0, this.__values__ = Z
            }

            function An(n) {
                this.__wrapped__ = n, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = 4294967295, this.__views__ = []
            }

            function Un() {}

            function zn(n) {
                var t = -1,
                    r = n ? n.length : 0;
                for (this.clear(); ++t < r;) {
                    var e = n[t];
                    this.set(e[0], e[1])
                }
            }

            function Mn(n) {
                var t = -1,
                    r = n ? n.length : 0;
                for (this.__data__ = new zn; ++t < r;) this.push(n[t])
            }

            function Ln(n, t) {
                var r = n.__data__;
                return Ur(t) ? (r = r.__data__, "__lodash_hash_undefined__" === ("string" == typeof t ? r.string : r.hash)[t]) : r.has(t)
            }

            function $n(n) {
                var t = -1,
                    r = n ? n.length : 0;
                for (this.clear(); ++t < r;) {
                    var e = n[t];
                    this.set(e[0], e[1])
                }
            }

            function Dn(n, t) {
                var r = qn(n, t);
                return !(0 > r) && (r == n.length - 1 ? n.pop() : Ou.call(n, r, 1), !0)
            }

            function Zn(n, t) {
                var r = qn(n, t);
                return 0 > r ? Z : n[r][1]
            }

            function qn(n, t) {
                for (var r = n.length; r--;)
                    if (se(n[r][0], t)) return r;
                return -1
            }

            function Pn(n, t, r) {
                var e = qn(n, t);
                0 > e ? n.push([t, r]) : n[e][1] = r
            }

            function Tn(n, t, r, e) {
                return n === Z || se(n, iu[r]) && !cu.call(e, r) ? t : n
            }

            function Gn(n, t, r) {
                (r !== Z && !se(n[t], r) || "number" == typeof t && r === Z && !(t in n)) && (n[t] = r)
            }

            function Yn(n, t, r) {
                var e = n[t];
                (!se(e, r) || se(e, iu[t]) && !cu.call(n, t) || r === Z && !(t in n)) && (n[t] = r)
            }

            function Hn(n, t, r, e) {
                return Ju(n, function(n, u, o) {
                    t(e, n, r(n), o)
                }), e
            }

            function Qn(n, t) {
                return n && Ht(t, Fe(t), n)
            }

            function Xn(n, t) {
                for (var r = -1, e = null == n, u = t.length, o = Array(u); ++r < u;) o[r] = e ? Z : Me(n, t[r]);
                return o
            }

            function nt(n, t, r) {
                return n === n && (r !== Z && (n = n > r ? r : n), t !== Z && (n = t > n ? t : n)), n
            }

            function tt(n, t, r, e, o, i) {
                var f;
                if (r && (f = o ? r(n, e, o, i) : r(n)), f !== Z) return f;
                if (!xe(n)) return n;
                if (e = No(n)) {
                    if (f = Ir(n), !t) return Yt(n, f)
                } else {
                    var c = kr(n),
                        a = "[object Function]" == c || "[object GeneratorFunction]" == c;
                    if (Do(n)) return Kt(n, t);
                    if ("[object Object]" != c && "[object Arguments]" != c && (!a || o)) return Cn[c] ? Rr(n, c, t) : o ? n : {};
                    if (C(n)) return o ? n : {};
                    if (f = Sr(a ? {} : n), !t) return Xt(n, Qn(f, n))
                }
                return i || (i = new $n), (o = i.get(n)) ? o : (i.set(n, f), (e ? u : at)(n, function(e, u) {
                    Yn(f, u, tt(e, t, r, u, n, i))
                }), e ? f : Xt(n, f))
            }

            function rt(n) {
                var t = Fe(n),
                    r = t.length;
                return function(e) {
                    if (null == e) return !r;
                    for (var u = r; u--;) {
                        var o = t[u],
                            i = n[o],
                            f = e[o];
                        if (f === Z && !(o in Object(e)) || !i(f)) return !1
                    }
                    return !0
                }
            }

            function et(n, t, r) {
                if ("function" != typeof n) throw new uu("Expected a function");
                return Au(function() {
                    n.apply(Z, r)
                }, t)
            }

            function ut(n, t, r, e) {
                var u = -1,
                    o = f,
                    i = !0,
                    l = n.length,
                    s = [],
                    h = t.length;
                if (!l) return s;
                r && (t = a(t, w(r))), e ? (o = c, i = !1) : t.length >= 200 && (o = Ln, i = !1, t = new Mn(t));
                n: for (; ++u < l;) {
                    var p = n[u],
                        _ = r ? r(p) : p;
                    if (i && _ === _) {
                        for (var g = h; g--;)
                            if (t[g] === _) continue n;
                        s.push(p)
                    } else o(t, _, e) || s.push(p)
                }
                return s
            }

            function ot(n, t) {
                var r = !0;
                return Ju(n, function(n, e, u) {
                    return r = !!t(n, e, u)
                }), r
            }

            function it(n, t) {
                var r = [];
                return Ju(n, function(n, e, u) {
                    t(n, e, u) && r.push(n)
                }), r
            }

            function ft(n, t, r, e) {
                e || (e = []);
                for (var u = -1, o = n.length; ++u < o;) {
                    var i = n[u];
                    ge(i) && (r || No(i) || pe(i)) ? t ? ft(i, t, r, e) : l(e, i) : r || (e[e.length] = i)
                }
                return e
            }

            function ct(n, t) {
                return null == n ? n : Hu(n, t, Ne)
            }

            function at(n, t) {
                return n && Hu(n, t, Fe)
            }

            function lt(n, t) {
                return n && Qu(n, t, Fe)
            }

            function st(n, t) {
                return i(t, function(t) {
                    return de(n[t])
                })
            }

            function ht(n, t) {
                t = Cr(t, n) ? [t + ""] : Nt(t);
                for (var r = 0, e = t.length; null != n && e > r;) n = n[t[r++]];
                return r && r == e ? n : Z
            }

            function pt(n, t) {
                return cu.call(n, t) || "object" == typeof n && t in n && null === xu(n)
            }

            function _t(n, t) {
                return t in Object(n)
            }

            function gt(n, t, r) {
                for (var e = r ? c : f, u = n.length, o = u, i = Array(u), l = []; o--;) {
                    var s = n[o];
                    o && t && (s = a(s, w(t))), i[o] = r || !t && 120 > s.length ? Z : new Mn(o && s)
                }
                var s = n[0],
                    h = -1,
                    p = s.length,
                    _ = i[0];
                n: for (; ++h < p;) {
                    var g = s[h],
                        v = t ? t(g) : g;
                    if (_ ? !Ln(_, v) : !e(l, v, r)) {
                        for (o = u; --o;) {
                            var d = i[o];
                            if (d ? !Ln(d, v) : !e(n[o], v, r)) continue n
                        }
                        _ && _.push(v), l.push(g)
                    }
                }
                return l
            }

            function vt(n, t, r, e) {
                return at(n, function(n, u, o) {
                    t(e, r(n), u, o)
                }), e
            }

            function dt(n, t, e) {
                return Cr(t, n) || (t = Nt(t), n = $r(n, t), t = Kr(t)), t = null == n ? n : n[t], null == t ? Z : r(t, n, e)
            }

            function yt(n, t, r, e, u) {
                if (n === t) return !0;
                if (null == n || null == t || !xe(n) && !je(t)) return n !== n && t !== t;
                n: {
                    var o = No(n),
                        i = No(t),
                        f = "[object Array]",
                        c = "[object Array]";o || (f = kr(n), "[object Arguments]" == f ? f = "[object Object]" : "[object Object]" != f && (o = Ie(n))),
                    i || (c = kr(t), "[object Arguments]" == c ? c = "[object Object]" : "[object Object]" != c && Ie(t));
                    var a = "[object Object]" == f && !C(n),
                        i = "[object Object]" == c && !C(t),
                        c = f == c;
                    if (!c || o || a) {
                        if (!(2 & e) && (f = a && cu.call(n, "__wrapped__"), i = i && cu.call(t, "__wrapped__"), f || i)) {
                            n = yt(f ? n.value() : n, i ? t.value() : t, r, e, u);
                            break n
                        }
                        c ? (u || (u = new $n), n = (o ? br : jr)(n, t, yt, r, e, u)) : n = !1
                    } else n = xr(n, t, f, yt, r, e)
                }
                return n
            }

            function bt(n, t, r, e) {
                var u = r.length,
                    o = u,
                    i = !e;
                if (null == n) return !o;
                for (n = Object(n); u--;) {
                    var f = r[u];
                    if (i && f[2] ? f[1] !== n[f[0]] : !(f[0] in n)) return !1
                }
                for (; ++u < o;) {
                    var f = r[u],
                        c = f[0],
                        a = n[c],
                        l = f[1];
                    if (i && f[2]) {
                        if (a === Z && !(c in n)) return !1
                    } else if (f = new $n, c = e ? e(a, l, c, n, t, f) : Z, c === Z ? !yt(l, a, e, 3, f) : !c) return !1
                }
                return !0
            }

            function xt(n) {
                var t = typeof n;
                return "function" == t ? n : null == n ? Ve : "object" == t ? No(n) ? At(n[0], n[1]) : wt(n) : Qe(n)
            }

            function jt(n) {
                n = null == n ? n : Object(n);
                var t, r = [];
                for (t in n) r.push(t);
                return r
            }

            function mt(n, t) {
                var r = -1,
                    e = _e(n) ? Array(n.length) : [];
                return Ju(n, function(n, u, o) {
                    e[++r] = t(n, u, o)
                }), e
            }

            function wt(n) {
                var t = Ar(n);
                if (1 == t.length && t[0][2]) {
                    var r = t[0][0],
                        e = t[0][1];
                    return function(n) {
                        return null != n && (n[r] === e && (e !== Z || r in Object(n)))
                    }
                }
                return function(r) {
                    return r === n || bt(r, n, t)
                }
            }

            function At(n, t) {
                return function(r) {
                    var e = Me(r, n);
                    return e === Z && e === t ? $e(r, n) : yt(t, e, Z, 3)
                }
            }

            function Ot(n, t, r, e, o) {
                if (n !== t) {
                    var i = No(t) || Ie(t) ? Z : Ne(t);
                    u(i || t, function(u, f) {
                        if (i && (f = u, u = t[f]), xe(u)) {
                            o || (o = new $n);
                            var c = f,
                                a = o,
                                l = n[c],
                                s = t[c],
                                h = a.get(s);
                            if (!h) {
                                var h = e ? e(l, s, c + "", n, t, a) : Z,
                                    p = h === Z;
                                p && (h = s, No(s) || Ie(s) ? No(l) ? h = r ? Yt(l) : l : ge(l) ? h = Yt(l) : (p = !1, h = tt(s)) : Ae(s) || pe(s) ? pe(l) ? h = Ue(l) : !xe(l) || r && de(l) ? (p = !1, h = tt(s)) : h = r ? tt(l) : l : p = !1), a.set(s, h), p && Ot(h, s, r, e, a)
                            }
                            Gn(n, c, h)
                        } else c = e ? e(n[f], u, f + "", n, t, o) : Z, c === Z && (c = u), Gn(n, f, c)
                    })
                }
            }

            function kt(n, t, r) {
                var e = -1,
                    u = wr();
                return t = a(t.length ? t : Array(1), function(n) {
                    return u(n)
                }), n = mt(n, function(n, r, u) {
                    return {
                        a: a(t, function(t) {
                            return t(n)
                        }),
                        b: ++e,
                        c: n
                    }
                }), b(n, function(n, t) {
                    var e;
                    n: {
                        e = -1;
                        for (var u = n.a, o = t.a, i = u.length, f = r.length; ++e < i;) {
                            var c = I(u[e], o[e]);
                            if (c) {
                                if (e >= f) {
                                    e = c;
                                    break n
                                }
                                e = c * ("desc" == r[e] ? -1 : 1);
                                break n
                            }
                        }
                        e = n.b - t.b
                    }
                    return e
                })
            }

            function Et(n, t) {
                return n = Object(n), s(t, function(t, r) {
                    return r in n && (t[r] = n[r]), t
                }, {})
            }

            function It(n, t) {
                var r = {};
                return ct(n, function(n, e) {
                    t(n, e) && (r[e] = n)
                }), r
            }

            function St(n) {
                return function(t) {
                    return null == t ? Z : t[n]
                }
            }

            function Rt(n) {
                return function(t) {
                    return ht(t, n)
                }
            }

            function Wt(n, t, r) {
                var e = -1,
                    u = t.length,
                    o = n;
                for (r && (o = a(n, function(n) {
                        return r(n)
                    })); ++e < u;)
                    for (var i = 0, f = t[e], f = r ? r(f) : f; - 1 < (i = d(o, f, i));) o !== n && Ou.call(o, i, 1), Ou.call(n, i, 1);
                return n
            }

            function Bt(n, t) {
                for (var r = n ? t.length : 0, e = r - 1; r--;) {
                    var u = t[r];
                    if (e == r || u != o) {
                        var o = u;
                        if (U(u)) Ou.call(n, u, 1);
                        else if (Cr(u, n)) delete n[u];
                        else {
                            var u = Nt(u),
                                i = $r(n, u);
                            null != i && delete i[Kr(u)]
                        }
                    }
                }
                return n
            }

            function Ct(n, t) {
                return n + Eu(Uu() * (t - n + 1))
            }

            function Ut(n, t, r, e) {
                t = Cr(t, n) ? [t + ""] : Nt(t);
                for (var u = -1, o = t.length, i = o - 1, f = n; null != f && ++u < o;) {
                    var c = t[u];
                    if (xe(f)) {
                        var a = r;
                        if (u != i) {
                            var l = f[c],
                                a = e ? e(l, c, f) : Z;
                            a === Z && (a = null == l ? U(t[u + 1]) ? [] : {} : l)
                        }
                        Yn(f, c, a)
                    }
                    f = f[c]
                }
                return n
            }

            function zt(n, t, r) {
                var e = -1,
                    u = n.length;
                for (0 > t && (t = -t > u ? 0 : u + t), r = r > u ? u : r, 0 > r && (r += u), u = t > r ? 0 : r - t >>> 0, t >>>= 0, r = Array(u); ++e < u;) r[e] = n[e + t];
                return r
            }

            function Mt(n, t) {
                var r;
                return Ju(n, function(n, e, u) {
                    return r = t(n, e, u), !r
                }), !!r
            }

            function Lt(n, t, r) {
                var e = 0,
                    u = n ? n.length : e;
                if ("number" == typeof t && t === t && 2147483647 >= u) {
                    for (; u > e;) {
                        var o = e + u >>> 1,
                            i = n[o];
                        (r ? t >= i : t > i) && null !== i ? e = o + 1 : u = o
                    }
                    return u
                }
                return $t(n, t, Ve, r)
            }

            function $t(n, t, r, e) {
                t = r(t);
                for (var u = 0, o = n ? n.length : 0, i = t !== t, f = null === t, c = t === Z; o > u;) {
                    var a = Eu((u + o) / 2),
                        l = r(n[a]),
                        s = l !== Z,
                        h = l === l;
                    (i ? h || e : f ? h && s && (e || null != l) : c ? h && (e || s) : null == l ? 0 : e ? t >= l : t > l) ? u = a + 1: o = a
                }
                return Bu(o, 4294967294)
            }

            function Ft(n, t) {
                for (var r = 0, e = n.length, u = n[0], o = t ? t(u) : u, i = o, f = 0, c = [u]; ++r < e;) u = n[r], o = t ? t(u) : u, se(o, i) || (i = o, c[++f] = u);
                return c
            }

            function Nt(n) {
                return No(n) ? n : Fr(n)
            }

            function Dt(n, t, r) {
                var e = -1,
                    u = f,
                    o = n.length,
                    i = !0,
                    a = [],
                    l = a;
                if (r) i = !1, u = c;
                else if (o < 200) l = t ? [] : a;
                else {
                    if (u = t ? null : no(n)) return $(u);
                    i = !1, u = Ln, l = new Mn
                }
                n: for (; ++e < o;) {
                    var s = n[e],
                        h = t ? t(s) : s;
                    if (i && h === h) {
                        for (var p = l.length; p--;)
                            if (l[p] === h) continue n;
                        t && l.push(h), a.push(s)
                    } else u(l, h, r) || (l !== a && l.push(h), a.push(s))
                }
                return a
            }

            function Zt(n, t, r, e) {
                for (var u = n.length, o = e ? u : -1;
                    (e ? o-- : ++o < u) && t(n[o], o, n););
                return r ? zt(n, e ? 0 : o, e ? o + 1 : u) : zt(n, e ? o + 1 : 0, e ? u : o)
            }

            function qt(n, t) {
                var r = n;
                return r instanceof An && (r = r.value()), s(t, function(n, t) {
                    return t.func.apply(t.thisArg, l([n], t.args))
                }, r)
            }

            function Pt(n, t, r) {
                for (var e = -1, u = n.length; ++e < u;) var o = o ? l(ut(o, n[e], t, r), ut(n[e], o, t, r)) : n[e];
                return o && o.length ? Dt(o, t, r) : []
            }

            function Tt(n, t, r) {
                for (var e = -1, u = n.length, o = t.length, i = {}; ++e < u;) r(i, n[e], o > e ? t[e] : Z);
                return i
            }

            function Kt(n, t) {
                if (t) return n.slice();
                var r = new n.constructor(n.length);
                return n.copy(r), r
            }

            function Gt(n) {
                var t = new n.constructor(n.byteLength);
                return new du(t).set(new du(n)), t
            }

            function Vt(n, t, r) {
                for (var e = r.length, u = -1, o = Wu(n.length - e, 0), i = -1, f = t.length, c = Array(f + o); ++i < f;) c[i] = t[i];
                for (; ++u < e;) c[r[u]] = n[u];
                for (; o--;) c[i++] = n[u++];
                return c
            }

            function Jt(n, t, r) {
                for (var e = -1, u = r.length, o = -1, i = Wu(n.length - u, 0), f = -1, c = t.length, a = Array(i + c); ++o < i;) a[o] = n[o];
                for (i = o; ++f < c;) a[i + f] = t[f];
                for (; ++e < u;) a[i + r[e]] = n[o++];
                return a
            }

            function Yt(n, t) {
                var r = -1,
                    e = n.length;
                for (t || (t = Array(e)); ++r < e;) t[r] = n[r];
                return t
            }

            function Ht(n, t, r) {
                return Qt(n, t, r)
            }

            function Qt(n, t, r, e) {
                r || (r = {});
                for (var u = -1, o = t.length; ++u < o;) {
                    var i = t[u],
                        f = e ? e(r[i], n[i], i, r, n) : n[i];
                    Yn(r, i, f)
                }
                return r
            }

            function Xt(n, t) {
                return Ht(n, eo(n), t)
            }

            function nr(n, t) {
                return function(r, u) {
                    var o = No(r) ? e : Hn,
                        i = t ? t() : {};
                    return o(r, n, wr(u), i)
                }
            }

            function tr(n) {
                return le(function(t, r) {
                    var e = -1,
                        u = r.length,
                        o = u > 1 ? r[u - 1] : Z,
                        i = u > 2 ? r[2] : Z,
                        o = "function" == typeof o ? (u--, o) : Z;
                    for (i && Br(r[0], r[1], i) && (o = 3 > u ? Z : o, u = 1), t = Object(t); ++e < u;)(i = r[e]) && n(t, i, e, o);
                    return t
                })
            }

            function rr(n, t) {
                return function(r, e) {
                    if (null == r) return r;
                    if (!_e(r)) return n(r, e);
                    for (var u = r.length, o = t ? u : -1, i = Object(r);
                        (t ? o-- : ++o < u) && !1 !== e(i[o], o, i););
                    return r
                }
            }

            function er(n) {
                return function(t, r, e) {
                    var u = -1,
                        o = Object(t);
                    e = e(t);
                    for (var i = e.length; i--;) {
                        var f = e[n ? i : ++u];
                        if (!1 === r(o[f], f, o)) break
                    }
                    return t
                }
            }

            function ur(n, t, r) {
                function e() {
                    return (this && this !== Vn && this instanceof e ? o : n).apply(u ? r : this, arguments)
                }
                var u = 1 & t,
                    o = fr(n);
                return e
            }

            function or(n) {
                return function(t) {
                    t = ze(t);
                    var r = En.test(t) ? t.match(kn) : Z,
                        e = r ? r[0] : t.charAt(0);
                    return t = r ? r.slice(1).join("") : t.slice(1), e[n]() + t
                }
            }

            function ir(n) {
                return function(t) {
                    return s(Ke(Pe(t)), n, "")
                }
            }

            function fr(n) {
                return function() {
                    var t = arguments;
                    switch (t.length) {
                        case 0:
                            return new n;
                        case 1:
                            return new n(t[0]);
                        case 2:
                            return new n(t[0], t[1]);
                        case 3:
                            return new n(t[0], t[1], t[2]);
                        case 4:
                            return new n(t[0], t[1], t[2], t[3]);
                        case 5:
                            return new n(t[0], t[1], t[2], t[3], t[4]);
                        case 6:
                            return new n(t[0], t[1], t[2], t[3], t[4], t[5]);
                        case 7:
                            return new n(t[0], t[1], t[2], t[3], t[4], t[5], t[6])
                    }
                    var r = Vu(n.prototype),
                        t = n.apply(r, t);
                    return xe(t) ? t : r
                }
            }

            function cr(n, t, e) {
                function u() {
                    for (var i = arguments.length, f = i, c = Array(i), a = this && this !== Vn && this instanceof u ? o : n, l = yn.placeholder || u.placeholder; f--;) c[f] = arguments[f];
                    return f = 3 > i && c[0] !== l && c[i - 1] !== l ? [] : L(c, l), i -= f.length, e > i ? vr(n, t, lr, l, Z, c, f, Z, Z, e - i) : r(a, this, c)
                }
                var o = fr(n);
                return u
            }

            function ar(n) {
                return le(function(t) {
                    t = ft(t);
                    var r = t.length,
                        e = r,
                        u = wn.prototype.thru;
                    for (n && t.reverse(); e--;) {
                        var o = t[e];
                        if ("function" != typeof o) throw new uu("Expected a function");
                        if (u && !i && "wrapper" == mr(o)) var i = new wn([], !0)
                    }
                    for (e = i ? e : r; ++e < r;) var o = t[e],
                        u = mr(o),
                        f = "wrapper" == u ? to(o) : Z,
                        i = f && zr(f[0]) && 424 == f[1] && !f[4].length && 1 == f[9] ? i[mr(f[0])].apply(i, f[3]) : 1 == o.length && zr(o) ? i[u]() : i.thru(o);
                    return function() {
                        var n = arguments,
                            e = n[0];
                        if (i && 1 == n.length && No(e) && e.length >= 200) return i.plant(e).value();
                        for (var u = 0, n = r ? t[u].apply(this, n) : e; ++u < r;) n = t[u].call(this, n);
                        return n
                    }
                })
            }

            function lr(n, t, r, e, u, o, i, f, c, a) {
                function l() {
                    for (var y = arguments.length, b = y, x = Array(y); b--;) x[b] = arguments[b];
                    if (e && (x = Vt(x, e, u)), o && (x = Jt(x, o, i)), _ || g) {
                        var b = yn.placeholder || l.placeholder,
                            j = L(x, b),
                            y = y - j.length;
                        if (a > y) return vr(n, t, lr, b, r, x, j, f, c, a - y)
                    }
                    if (y = h ? r : this, b = p ? y[n] : n, f)
                        for (var j = x.length, m = Bu(f.length, j), w = Yt(x); m--;) {
                            var A = f[m];
                            x[m] = U(A, j) ? w[A] : Z
                        } else v && x.length > 1 && x.reverse();
                    return s && x.length > c && (x.length = c), this && this !== Vn && this instanceof l && (b = d || fr(b)), b.apply(y, x)
                }
                var s = 128 & t,
                    h = 1 & t,
                    p = 2 & t,
                    _ = 8 & t,
                    g = 16 & t,
                    v = 512 & t,
                    d = p ? Z : fr(n);
                return l
            }

            function sr(n, t) {
                return function(r, e) {
                    return vt(r, n, t(e), {})
                }
            }

            function hr(n) {
                return le(function(t) {
                    return t = a(ft(t), wr()), le(function(e) {
                        var u = this;
                        return n(t, function(n) {
                            return r(n, u, e)
                        })
                    })
                })
            }

            function pr(n, t, r) {
                return t = We(t), n = F(n), t && t > n ? (t -= n, r = r === Z ? " " : r + "", n = Te(r, ku(t / F(r))), En.test(r) ? n.match(kn).slice(0, t).join("") : n.slice(0, t)) : ""
            }

            function _r(n, t, e, u) {
                function o() {
                    for (var t = -1, c = arguments.length, a = -1, l = u.length, s = Array(l + c), h = this && this !== Vn && this instanceof o ? f : n; ++a < l;) s[a] = u[a];
                    for (; c--;) s[a++] = arguments[++t];
                    return r(h, i ? e : this, s)
                }
                var i = 1 & t,
                    f = fr(n);
                return o
            }

            function gr(n) {
                return function(t, r, e) {
                    e && "number" != typeof e && Br(t, r, e) && (r = e = Z), t = Ce(t), t = t === t ? t : 0, r === Z ? (r = t, t = 0) : r = Ce(r) || 0, e = e === Z ? r > t ? 1 : -1 : Ce(e) || 0;
                    var u = -1;
                    r = Wu(ku((r - t) / (e || 1)), 0);
                    for (var o = Array(r); r--;) o[n ? r : ++u] = t, t += e;
                    return o
                }
            }

            function vr(n, t, r, e, u, o, i, f, c, a) {
                var l = 8 & t;
                f = f ? Yt(f) : Z;
                var s = l ? i : Z;
                i = l ? Z : i;
                var h = l ? o : Z;
                return o = l ? Z : o, t = (t | (l ? 32 : 64)) & ~(l ? 64 : 32), 4 & t || (t &= -4), t = [n, t, u, h, s, o, i, f, c, a], r = r.apply(Z, t), zr(n) && uo(r, t), r.placeholder = e, r
            }

            function dr(n) {
                var t = ru[n];
                return function(n, r) {
                    if (n = Ce(n), r = We(r)) {
                        var e = (ze(n) + "e").split("e"),
                            e = t(e[0] + "e" + (+e[1] + r)),
                            e = (ze(e) + "e").split("e");
                        return +(e[0] + "e" + (+e[1] - r))
                    }
                    return t(n)
                }
            }

            function yr(n, t, r, e, u, o, i, f) {
                var c = 2 & t;
                if (!c && "function" != typeof n) throw new uu("Expected a function");
                var a = e ? e.length : 0;
                if (a || (t &= -97, e = u = Z), i = i === Z ? i : Wu(We(i), 0), f = f === Z ? f : We(f), a -= u ? u.length : 0, 64 & t) {
                    var l = e,
                        s = u;
                    e = u = Z
                }
                var h = c ? Z : to(n);
                return o = [n, t, r, e, u, l, s, o, i, f], h && (r = o[1], n = h[1], t = r | n, e = 128 == n && 8 == r || 128 == n && 256 == r && h[8] >= o[7].length || 384 == n && h[8] >= h[7].length && 8 == r, 131 > t || e) && (1 & n && (o[2] = h[2], t |= 1 & r ? 0 : 4), (r = h[3]) && (e = o[3], o[3] = e ? Vt(e, r, h[4]) : Yt(r), o[4] = e ? L(o[3], "__lodash_placeholder__") : Yt(h[4])), (r = h[5]) && (e = o[5], o[5] = e ? Jt(e, r, h[6]) : Yt(r), o[6] = e ? L(o[5], "__lodash_placeholder__") : Yt(h[6])), (r = h[7]) && (o[7] = Yt(r)), 128 & n && (o[8] = null == o[8] ? h[8] : Bu(o[8], h[8])), null == o[9] && (o[9] = h[9]), o[0] = h[0], o[1] = t), n = o[0], t = o[1], r = o[2], e = o[3], u = o[4], f = o[9] = null == o[9] ? c ? 0 : n.length : Wu(o[9] - a, 0), !f && 24 & t && (t &= -25), c = t && 1 != t ? 8 == t || 16 == t ? cr(n, t, f) : 32 != t && 33 != t || u.length ? lr.apply(Z, o) : _r(n, t, r, e) : ur(n, t, r), (h ? Xu : uo)(c, o)
            }

            function br(n, t, r, e, u, o) {
                var i = -1,
                    f = 2 & u,
                    c = 1 & u,
                    a = n.length,
                    l = t.length;
                if (!(a == l || f && l > a)) return !1;
                if (l = o.get(n)) return l == t;
                for (l = !0, o.set(n, t); ++i < a;) {
                    var s = n[i],
                        h = t[i];
                    if (e) var _ = f ? e(h, s, i, t, n, o) : e(s, h, i, n, t, o);
                    if (_ !== Z) {
                        if (_) continue;
                        l = !1;
                        break
                    }
                    if (c) {
                        if (!p(t, function(n) {
                                return s === n || r(s, n, e, u, o)
                            })) {
                            l = !1;
                            break
                        }
                    } else if (s !== h && !r(s, h, e, u, o)) {
                        l = !1;
                        break
                    }
                }
                return o["delete"](n), l
            }

            function xr(n, t, r, e, u, o) {
                switch (r) {
                    case "[object ArrayBuffer]":
                        if (n.byteLength != t.byteLength || !e(new du(n), new du(t))) break;
                        return !0;
                    case "[object Boolean]":
                    case "[object Date]":
                        return +n == +t;
                    case "[object Error]":
                        return n.name == t.name && n.message == t.message;
                    case "[object Number]":
                        return n != +n ? t != +t : n == +t;
                    case "[object RegExp]":
                    case "[object String]":
                        return n == t + "";
                    case "[object Map]":
                        var i = M;
                    case "[object Set]":
                        return i || (i = $), (2 & o || n.size == t.size) && e(i(n), i(t), u, 1 | o);
                    case "[object Symbol]":
                        return !!vu && Tu.call(n) == Tu.call(t)
                }
                return !1
            }

            function jr(n, t, r, e, u, o) {
                var i = 2 & u,
                    f = Fe(n),
                    c = f.length,
                    a = Fe(t).length;
                if (c != a && !i) return !1;
                for (var l = c; l--;) {
                    var s = f[l];
                    if (!(i ? s in t : pt(t, s))) return !1
                }
                if (a = o.get(n)) return a == t;
                a = !0, o.set(n, t);
                for (var h = i; ++l < c;) {
                    var s = f[l],
                        p = n[s],
                        _ = t[s];
                    if (e) var g = i ? e(_, p, s, t, n, o) : e(p, _, s, n, t, o);
                    if (g === Z ? p !== _ && !r(p, _, e, u, o) : !g) {
                        a = !1;
                        break
                    }
                    h || (h = "constructor" == s)
                }
                return a && !h && (r = n.constructor, e = t.constructor, r != e && "constructor" in n && "constructor" in t && !("function" == typeof r && r instanceof r && "function" == typeof e && e instanceof e) && (a = !1)), o["delete"](n), a
            }

            function mr(n) {
                for (var t = n.name + "", r = Gu[t], e = cu.call(Gu, t) ? r.length : 0; e--;) {
                    var u = r[e],
                        o = u.func;
                    if (null == o || o == n) return u.name
                }
                return t
            }

            function wr() {
                var n = yn.iteratee || Je,
                    n = n === Je ? xt : n;
                return arguments.length ? n(arguments[0], arguments[1]) : n
            }

            function Ar(n) {
                n = De(n);
                for (var t = n.length; t--;) {
                    var r, e = n[t];
                    r = n[t][1], r = r === r && !xe(r), e[2] = r
                }
                return n
            }

            function Or(n, t) {
                var r = null == n ? Z : n[t];
                return me(r) ? r : Z
            }

            function kr(n) {
                return su.call(n)
            }

            function Er(n, t, r) {
                if (null == n) return !1;
                var e = r(n, t);
                return e || Cr(t) || (t = Nt(t), n = $r(n, t), null != n && (t = Kr(t), e = r(n, t))), r = n ? n.length : Z, e || !!r && be(r) && U(t, r) && (No(n) || ke(n) || pe(n))
            }

            function Ir(n) {
                var t = n.length,
                    r = n.constructor(t);
                return t && "string" == typeof n[0] && cu.call(n, "index") && (r.index = n.index, r.input = n.input), r
            }

            function Sr(n) {
                return Mr(n) ? {} : (n = n.constructor, Vu(de(n) ? n.prototype : Z))
            }

            function Rr(r, e, u) {
                var o = r.constructor;
                switch (e) {
                    case "[object ArrayBuffer]":
                        return Gt(r);
                    case "[object Boolean]":
                    case "[object Date]":
                        return new o(+r);
                    case "[object Float32Array]":
                    case "[object Float64Array]":
                    case "[object Int8Array]":
                    case "[object Int16Array]":
                    case "[object Int32Array]":
                    case "[object Uint8Array]":
                    case "[object Uint8ClampedArray]":
                    case "[object Uint16Array]":
                    case "[object Uint32Array]":
                        return e = r.buffer, new r.constructor(u ? Gt(e) : e, r.byteOffset, r.length);
                    case "[object Map]":
                        return u = r.constructor, s(M(r), n, new u);
                    case "[object Number]":
                    case "[object String]":
                        return new o(r);
                    case "[object RegExp]":
                        return u = new r.constructor(r.source, hn.exec(r)), u.lastIndex = r.lastIndex, u;
                    case "[object Set]":
                        return u = r.constructor, s($(r), t, new u);
                    case "[object Symbol]":
                        return vu ? Object(Tu.call(r)) : {}
                }
            }

            function Wr(n) {
                var t = n ? n.length : Z;
                return be(t) && (No(n) || ke(n) || pe(n)) ? j(t, String) : null
            }

            function Br(n, t, r) {
                if (!xe(r)) return !1;
                var e = typeof t;
                return !!("number" == e ? _e(r) && U(t, r.length) : "string" == e && t in r) && se(r[t], n)
            }

            function Cr(n, t) {
                return "number" == typeof n || !No(n) && (rn.test(n) || !tn.test(n) || null != t && n in Object(t))
            }

            function Ur(n) {
                var t = typeof n;
                return "number" == t || "boolean" == t || "string" == t && "__proto__" !== n || null == n
            }

            function zr(n) {
                var t = mr(n),
                    r = yn[t];
                return "function" == typeof r && t in An.prototype && (n === r || (t = to(r), !!t && n === t[0]))
            }

            function Mr(n) {
                var t = n && n.constructor;
                return n === ("function" == typeof t && t.prototype || iu)
            }

            function Lr(n, t, r, e, u, o) {
                return xe(n) && xe(t) && (o.set(t, n), Ot(n, t, Z, Lr, o)), n
            }

            function $r(n, t) {
                return 1 == t.length ? n : Me(n, zt(t, 0, -1))
            }

            function Fr(n) {
                var t = [];
                return ze(n).replace(en, function(n, r, e, u) {
                    t.push(e ? u.replace(ln, "$1") : r || n)
                }), t
            }

            function Nr(n) {
                return ge(n) ? n : []
            }

            function Dr(n) {
                return "function" == typeof n ? n : Ve
            }

            function Zr(n) {
                if (n instanceof An) return n.clone();
                var t = new wn(n.__wrapped__, n.__chain__);
                return t.__actions__ = Yt(n.__actions__), t.__index__ = n.__index__, t.__values__ = n.__values__, t
            }

            function qr(n, t, r) {
                var e = n ? n.length : 0;
                return e ? (t = r || t === Z ? 1 : We(t), zt(n, 0 > t ? 0 : t, e)) : []
            }

            function Pr(n, t, r) {
                var e = n ? n.length : 0;
                return e ? (t = r || t === Z ? 1 : We(t), t = e - t, zt(n, 0, 0 > t ? 0 : t)) : []
            }

            function Tr(n) {
                return n ? n[0] : Z
            }

            function Kr(n) {
                var t = n ? n.length : 0;
                return t ? n[t - 1] : Z
            }

            function Gr(n, t) {
                return n && n.length && t && t.length ? Wt(n, t) : n
            }

            function Vr(n) {
                return n ? zu.call(n) : n
            }

            function Jr(n) {
                if (!n || !n.length) return [];
                var t = 0;
                return n = i(n, function(n) {
                    return ge(n) ? (t = Wu(n.length, t), !0) : void 0
                }), j(t, function(t) {
                    return a(n, St(t))
                })
            }

            function Yr(n, t) {
                if (!n || !n.length) return [];
                var e = Jr(n);
                return null == t ? e : a(e, function(n) {
                    return r(t, Z, n)
                })
            }

            function Hr(n) {
                return n = yn(n), n.__chain__ = !0, n
            }

            function Qr(n, t) {
                return t(n)
            }

            function Xr() {
                return this
            }

            function ne(n, t) {
                return "function" == typeof t && No(n) ? u(n, t) : Ju(n, Dr(t))
            }

            function te(n, t) {
                var r;
                if ("function" == typeof t && No(n)) {
                    for (r = n.length; r-- && !1 !== t(n[r], r, n););
                    r = n
                } else r = Yu(n, Dr(t));
                return r
            }

            function re(n, t) {
                return (No(n) ? a : mt)(n, wr(t, 3))
            }

            function ee(n, t) {
                var r = -1,
                    e = Re(n),
                    u = e.length,
                    o = u - 1;
                for (t = nt(We(t), 0, u); ++r < t;) {
                    var u = Ct(r, o),
                        i = e[u];
                    e[u] = e[r], e[r] = i
                }
                return e.length = t, e
            }

            function ue(n, t, r) {
                return t = r ? Z : t, t = n && null == t ? n.length : t, yr(n, 128, Z, Z, Z, Z, t)
            }

            function oe(n, t) {
                var r;
                if ("function" != typeof t) throw new uu("Expected a function");
                return n = We(n),
                    function() {
                        return 0 < --n && (r = t.apply(this, arguments)), 1 >= n && (t = Z), r
                    }
            }

            function ie(n, t, r) {
                return t = r ? Z : t, n = yr(n, 8, Z, Z, Z, Z, Z, t), n.placeholder = yn.placeholder || ie.placeholder, n
            }

            function fe(n, t, r) {
                return t = r ? Z : t, n = yr(n, 16, Z, Z, Z, Z, Z, t), n.placeholder = yn.placeholder || fe.placeholder, n
            }

            function ce(n, t, r) {
                function e() {
                    p && yu(p), a && yu(a), g = 0, c = a = h = p = _ = Z
                }

                function u(t, r) {
                    r && yu(r), a = p = _ = Z, t && (g = Wo(), l = n.apply(h, c), p || a || (c = h = Z))
                }

                function o() {
                    var n = t - (Wo() - s);
                    0 >= n || n > t ? u(_, a) : p = Au(o, n)
                }

                function i() {
                    u(y, p)
                }

                function f() {
                    if (c = arguments, s = Wo(), h = this, _ = y && (p || !v), !1 === d) var r = v && !p;
                    else {
                        g || a || v || (g = s);
                        var e = d - (s - g),
                            u = 0 >= e || e > d;
                        u ? (a && (a = yu(a)), g = s, l = n.apply(h, c)) : a || (a = Au(i, e))
                    }
                    return u && p ? p = yu(p) : p || t === d || (p = Au(o, t)), r && (u = !0, l = n.apply(h, c)), !u || p || a || (c = h = Z), l
                }
                var c, a, l, s, h, p, _, g = 0,
                    v = !1,
                    d = !1,
                    y = !0;
                if ("function" != typeof n) throw new uu("Expected a function");
                return t = Ce(t) || 0, xe(r) && (v = !!r.leading, d = "maxWait" in r && Wu(Ce(r.maxWait) || 0, t), y = "trailing" in r ? !!r.trailing : y), f.cancel = e, f.flush = function() {
                    return (p && _ || a && y) && (l = n.apply(h, c)), e(), l
                }, f
            }

            function ae(n, t) {
                if ("function" != typeof n || t && "function" != typeof t) throw new uu("Expected a function");
                var r = function() {
                    var e = arguments,
                        u = t ? t.apply(this, e) : e[0],
                        o = r.cache;
                    return o.has(u) ? o.get(u) : (e = n.apply(this, e), r.cache = o.set(u, e), e)
                };
                return r.cache = new ae.Cache, r
            }

            function le(n, t) {
                if ("function" != typeof n) throw new uu("Expected a function");
                return t = Wu(t === Z ? n.length - 1 : We(t), 0),
                    function() {
                        for (var e = arguments, u = -1, o = Wu(e.length - t, 0), i = Array(o); ++u < o;) i[u] = e[t + u];
                        switch (t) {
                            case 0:
                                return n.call(this, i);
                            case 1:
                                return n.call(this, e[0], i);
                            case 2:
                                return n.call(this, e[0], e[1], i)
                        }
                        for (o = Array(t + 1), u = -1; ++u < t;) o[u] = e[u];
                        return o[t] = i, r(n, this, o)
                    }
            }

            function se(n, t) {
                return n === t || n !== n && t !== t
            }

            function he(n, t) {
                return n > t
            }

            function pe(n) {
                return ge(n) && cu.call(n, "callee") && (!wu.call(n, "callee") || "[object Arguments]" == su.call(n))
            }

            function _e(n) {
                return null != n && !("function" == typeof n && de(n)) && be(ro(n))
            }

            function ge(n) {
                return je(n) && _e(n)
            }

            function ve(n) {
                return je(n) && "string" == typeof n.message && "[object Error]" == su.call(n)
            }

            function de(n) {
                return n = xe(n) ? su.call(n) : "", "[object Function]" == n || "[object GeneratorFunction]" == n
            }

            function ye(n) {
                return "number" == typeof n && n == We(n)
            }

            function be(n) {
                return "number" == typeof n && n > -1 && 0 == n % 1 && 9007199254740991 >= n
            }

            function xe(n) {
                var t = typeof n;
                return !!n && ("object" == t || "function" == t)
            }

            function je(n) {
                return !!n && "object" == typeof n
            }

            function me(n) {
                return null != n && (de(n) ? pu.test(fu.call(n)) : je(n) && (C(n) ? pu : vn).test(n))
            }

            function we(n) {
                return "number" == typeof n || je(n) && "[object Number]" == su.call(n)
            }

            function Ae(n) {
                if (!je(n) || "[object Object]" != su.call(n) || C(n)) return !1;
                var t = iu;
                return "function" == typeof n.constructor && (t = xu(n)), null === t || (n = t.constructor, "function" == typeof n && n instanceof n && fu.call(n) == lu)
            }

            function Oe(n) {
                return xe(n) && "[object RegExp]" == su.call(n)
            }

            function ke(n) {
                return "string" == typeof n || !No(n) && je(n) && "[object String]" == su.call(n)
            }

            function Ee(n) {
                return "symbol" == typeof n || je(n) && "[object Symbol]" == su.call(n)
            }

            function Ie(n) {
                return je(n) && be(n.length) && !!Bn[su.call(n)]
            }

            function Se(n, t) {
                return t > n
            }

            function Re(n) {
                if (!n) return [];
                if (_e(n)) return ke(n) ? n.match(kn) : Yt(n);
                if (mu && n[mu]) return z(n[mu]());
                var t = kr(n);
                return ("[object Map]" == t ? M : "[object Set]" == t ? $ : Ze)(n)
            }

            function We(n) {
                if (!n) return 0 === n ? n : 0;
                if (n = Ce(n), n === q || n === -q) return 17976931348623157e292 * (0 > n ? -1 : 1);
                var t = n % 1;
                return n === n ? t ? n - t : n : 0
            }

            function Be(n) {
                return n ? nt(We(n), 0, 4294967295) : 0
            }

            function Ce(n) {
                if (xe(n) && (n = de(n.valueOf) ? n.valueOf() : n, n = xe(n) ? n + "" : n), "string" != typeof n) return 0 === n ? n : +n;
                n = n.replace(fn, "");
                var t = gn.test(n);
                return t || dn.test(n) ? Nn(n.slice(2), t ? 2 : 8) : _n.test(n) ? P : +n
            }

            function Ue(n) {
                return Ht(n, Ne(n))
            }

            function ze(n) {
                if ("string" == typeof n) return n;
                if (null == n) return "";
                if (Ee(n)) return vu ? Ku.call(n) : "";
                var t = n + "";
                return "0" == t && 1 / n == -q ? "-0" : t
            }

            function Me(n, t, r) {
                return n = null == n ? Z : ht(n, t), n === Z ? r : n
            }

            function Le(n, t) {
                return Er(n, t, pt)
            }

            function $e(n, t) {
                return Er(n, t, _t)
            }

            function Fe(n) {
                var t = Mr(n);
                if (!t && !_e(n)) return Ru(Object(n));
                var r, e = Wr(n),
                    u = !!e,
                    e = e || [],
                    o = e.length;
                for (r in n) !pt(n, r) || u && ("length" == r || U(r, o)) || t && "constructor" == r || e.push(r);
                return e
            }

            function Ne(n) {
                for (var t = -1, r = Mr(n), e = jt(n), u = e.length, o = Wr(n), i = !!o, o = o || [], f = o.length; ++t < u;) {
                    var c = e[t];
                    i && ("length" == c || U(c, f)) || "constructor" == c && (r || !cu.call(n, c)) || o.push(c)
                }
                return o
            }

            function De(n) {
                return m(n, Fe(n))
            }

            function Ze(n) {
                return n ? A(n, Fe(n)) : []
            }

            function qe(n) {
                return ii(ze(n).toLowerCase())
            }

            function Pe(n) {
                return (n = ze(n)) && n.replace(bn, S).replace(On, "")
            }

            function Te(n, t) {
                n = ze(n), t = We(t);
                var r = "";
                if (!n || 1 > t || t > 9007199254740991) return r;
                do {
                    t % 2 && (r += n), t = Eu(t / 2), n += n
                } while (t);
                return r
            }

            function Ke(n, t, r) {
                return n = ze(n), t = r ? Z : t, t === Z && (t = Rn.test(n) ? Sn : In), n.match(t) || []
            }

            function Ge(n) {
                return function() {
                    return n
                }
            }

            function Ve(n) {
                return n
            }

            function Je(n) {
                return xt("function" == typeof n ? n : tt(n, !0))
            }

            function Ye(n, t, r) {
                var e = Fe(t),
                    o = st(t, e);
                null != r || xe(t) && (o.length || !e.length) || (r = t, t = n, n = this, o = st(t, Fe(t)));
                var i = !(xe(r) && "chain" in r) || r.chain,
                    f = de(n);
                return u(o, function(r) {
                    var e = t[r];
                    n[r] = e, f && (n.prototype[r] = function() {
                        var t = this.__chain__;
                        if (i || t) {
                            var r = n(this.__wrapped__);
                            return (r.__actions__ = Yt(this.__actions__)).push({
                                func: e,
                                args: arguments,
                                thisArg: n
                            }), r.__chain__ = t, r
                        }
                        return e.apply(n, l([this.value()], arguments))
                    })
                }), n
            }

            function He() {}

            function Qe(n) {
                return Cr(n) ? St(n) : Rt(n)
            }

            function Xe(n) {
                return n && n.length ? x(n, Ve) : 0
            }
            E = E ? Jn.defaults({}, E, Jn.pick(Vn, Wn)) : Vn;
            var nu = E.Date,
                tu = E.Error,
                ru = E.Math,
                eu = E.RegExp,
                uu = E.TypeError,
                ou = E.Array.prototype,
                iu = E.Object.prototype,
                fu = E.Function.prototype.toString,
                cu = iu.hasOwnProperty,
                au = 0,
                lu = fu.call(Object),
                su = iu.toString,
                hu = Vn._,
                pu = eu("^" + fu.call(cu).replace(un, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"),
                _u = Kn ? E.Buffer : Z,
                gu = E.Reflect,
                vu = E.Symbol,
                du = E.Uint8Array,
                yu = E.clearTimeout,
                bu = gu ? gu.enumerate : Z,
                xu = Object.getPrototypeOf,
                ju = Object.getOwnPropertySymbols,
                mu = "symbol" == typeof(mu = vu && vu.iterator) ? mu : Z,
                wu = iu.propertyIsEnumerable,
                Au = E.setTimeout,
                Ou = ou.splice,
                ku = ru.ceil,
                Eu = ru.floor,
                Iu = E.isFinite,
                Su = ou.join,
                Ru = Object.keys,
                Wu = ru.max,
                Bu = ru.min,
                Cu = E.parseInt,
                Uu = ru.random,
                zu = ou.reverse,
                Mu = Or(E, "Map"),
                Lu = Or(E, "Set"),
                $u = Or(E, "WeakMap"),
                Fu = Or(Object, "create"),
                Nu = $u && new $u,
                Du = Mu ? fu.call(Mu) : "",
                Zu = Lu ? fu.call(Lu) : "",
                qu = $u ? fu.call($u) : "",
                Pu = vu ? vu.prototype : Z,
                Tu = vu ? Pu.valueOf : Z,
                Ku = vu ? Pu.toString : Z,
                Gu = {};
            yn.templateSettings = {
                escape: Q,
                evaluate: X,
                interpolate: nn,
                variable: "",
                imports: {
                    _: yn
                }
            };
            var Vu = function() {
                    function n() {}
                    return function(t) {
                        if (xe(t)) {
                            n.prototype = t;
                            var r = new n;
                            n.prototype = Z
                        }
                        return r || {}
                    }
                }(),
                Ju = rr(at),
                Yu = rr(lt, !0),
                Hu = er(),
                Qu = er(!0);
            bu && !wu.call({
                valueOf: 1
            }, "valueOf") && (jt = function(n) {
                return z(bu(n))
            });
            var Xu = Nu ? function(n, t) {
                    return Nu.set(n, t), n
                } : Ve,
                no = Lu && 2 === new Lu([1, 2]).size ? function(n) {
                    return new Lu(n)
                } : He,
                to = Nu ? function(n) {
                    return Nu.get(n)
                } : He,
                ro = St("length"),
                eo = ju || function() {
                    return []
                };
            (Mu && "[object Map]" != kr(new Mu) || Lu && "[object Set]" != kr(new Lu) || $u && "[object WeakMap]" != kr(new $u)) && (kr = function(n) {
                var t = su.call(n);
                if (n = "[object Object]" == t ? n.constructor : null, n = "function" == typeof n ? fu.call(n) : "") switch (n) {
                    case Du:
                        return "[object Map]";
                    case Zu:
                        return "[object Set]";
                    case qu:
                        return "[object WeakMap]"
                }
                return t
            });
            var uo = function() {
                    var n = 0,
                        t = 0;
                    return function(r, e) {
                        var u = Wo(),
                            o = 16 - (u - t);
                        if (t = u, o > 0) {
                            if (150 <= ++n) return r
                        } else n = 0;
                        return Xu(r, e)
                    }
                }(),
                oo = le(function(n, t) {
                    No(n) || (n = null == n ? [] : [Object(n)]), t = ft(t);
                    for (var r = n, e = t, u = -1, o = r.length, i = -1, f = e.length, c = Array(o + f); ++u < o;) c[u] = r[u];
                    for (; ++i < f;) c[u++] = e[i];
                    return c
                }),
                io = le(function(n, t) {
                    return ge(n) ? ut(n, ft(t, !1, !0)) : []
                }),
                fo = le(function(n, t) {
                    var r = Kr(t);
                    return ge(r) && (r = Z), ge(n) ? ut(n, ft(t, !1, !0), wr(r)) : []
                }),
                co = le(function(n, t) {
                    var r = Kr(t);
                    return ge(r) && (r = Z), ge(n) ? ut(n, ft(t, !1, !0), Z, r) : []
                }),
                ao = le(function(n) {
                    var t = a(n, Nr);
                    return t.length && t[0] === n[0] ? gt(t) : []
                }),
                lo = le(function(n) {
                    var t = Kr(n),
                        r = a(n, Nr);
                    return t === Kr(r) ? t = Z : r.pop(), r.length && r[0] === n[0] ? gt(r, wr(t)) : []
                }),
                so = le(function(n) {
                    var t = Kr(n),
                        r = a(n, Nr);
                    return t === Kr(r) ? t = Z : r.pop(), r.length && r[0] === n[0] ? gt(r, Z, t) : []
                }),
                ho = le(Gr),
                po = le(function(n, t) {
                    t = a(ft(t), String);
                    var r = Xn(n, t);
                    return Bt(n, t.sort(I)), r
                }),
                _o = le(function(n) {
                    return Dt(ft(n, !1, !0))
                }),
                go = le(function(n) {
                    var t = Kr(n);
                    return ge(t) && (t = Z), Dt(ft(n, !1, !0), wr(t))
                }),
                vo = le(function(n) {
                    var t = Kr(n);
                    return ge(t) && (t = Z), Dt(ft(n, !1, !0), Z, t)
                }),
                yo = le(function(n, t) {
                    return ge(n) ? ut(n, t) : []
                }),
                bo = le(function(n) {
                    return Pt(i(n, ge))
                }),
                xo = le(function(n) {
                    var t = Kr(n);
                    return ge(t) && (t = Z), Pt(i(n, ge), wr(t))
                }),
                jo = le(function(n) {
                    var t = Kr(n);
                    return ge(t) && (t = Z), Pt(i(n, ge), Z, t)
                }),
                mo = le(Jr),
                wo = le(function(n) {
                    var t = n.length,
                        t = t > 1 ? n[t - 1] : Z,
                        t = "function" == typeof t ? (n.pop(), t) : Z;
                    return Yr(n, t)
                }),
                Ao = le(function(n) {
                    n = ft(n);
                    var t = n.length,
                        r = t ? n[0] : 0,
                        e = this.__wrapped__,
                        u = function(t) {
                            return Xn(t, n)
                        };
                    return 1 >= t && !this.__actions__.length && e instanceof An && U(r) ? (e = e.slice(r, +r + (t ? 1 : 0)), e.__actions__.push({
                        func: Qr,
                        args: [u],
                        thisArg: Z
                    }), new wn(e, this.__chain__).thru(function(n) {
                        return t && !n.length && n.push(Z), n
                    })) : this.thru(u)
                }),
                Oo = nr(function(n, t, r) {
                    cu.call(n, r) ? ++n[r] : n[r] = 1
                }),
                ko = nr(function(n, t, r) {
                    cu.call(n, r) ? n[r].push(t) : n[r] = [t]
                }),
                Eo = le(function(n, t, e) {
                    var u = -1,
                        o = "function" == typeof t,
                        i = Cr(t),
                        f = _e(n) ? Array(n.length) : [];
                    return Ju(n, function(n) {
                        var c = o ? t : i && null != n ? n[t] : Z;
                        f[++u] = c ? r(c, n, e) : dt(n, t, e)
                    }), f
                }),
                Io = nr(function(n, t, r) {
                    n[r] = t
                }),
                So = nr(function(n, t, r) {
                    n[r ? 0 : 1].push(t)
                }, function() {
                    return [
                        [],
                        []
                    ]
                }),
                Ro = le(function(n, t) {
                    if (null == n) return [];
                    var r = t.length;
                    return r > 1 && Br(n, t[0], t[1]) ? t = [] : r > 2 && Br(t[0], t[1], t[2]) && (t.length = 1), kt(n, ft(t), [])
                }),
                Wo = nu.now,
                Bo = le(function(n, t, r) {
                    var e = 1;
                    if (r.length) var u = L(r, yn.placeholder || Bo.placeholder),
                        e = 32 | e;
                    return yr(n, e, t, r, u)
                }),
                Co = le(function(n, t, r) {
                    var e = 3;
                    if (r.length) var u = L(r, yn.placeholder || Co.placeholder),
                        e = 32 | e;
                    return yr(t, e, n, r, u)
                }),
                Uo = le(function(n, t) {
                    return et(n, 1, t)
                }),
                zo = le(function(n, t, r) {
                    return et(n, Ce(t) || 0, r)
                }),
                Mo = le(function(n, t) {
                    t = a(ft(t), wr());
                    var e = t.length;
                    return le(function(u) {
                        for (var o = -1, i = Bu(u.length, e); ++o < i;) u[o] = t[o].call(this, u[o]);
                        return r(n, this, u)
                    })
                }),
                Lo = le(function(n, t) {
                    var r = L(t, yn.placeholder || Lo.placeholder);
                    return yr(n, 32, Z, t, r)
                }),
                $o = le(function(n, t) {
                    var r = L(t, yn.placeholder || $o.placeholder);
                    return yr(n, 64, Z, t, r)
                }),
                Fo = le(function(n, t) {
                    return yr(n, 256, Z, Z, Z, ft(t))
                }),
                No = Array.isArray,
                Do = _u ? function(n) {
                    return n instanceof _u
                } : Ge(!1),
                Zo = tr(function(n, t) {
                    Ht(t, Fe(t), n)
                }),
                qo = tr(function(n, t) {
                    Ht(t, Ne(t), n)
                }),
                Po = tr(function(n, t, r, e) {
                    Qt(t, Ne(t), n, e)
                }),
                To = tr(function(n, t, r, e) {
                    Qt(t, Fe(t), n, e)
                }),
                Ko = le(function(n, t) {
                    return Xn(n, ft(t))
                }),
                Go = le(function(n) {
                    return n.push(Z, Tn), r(Po, Z, n)
                }),
                Vo = le(function(n) {
                    return n.push(Z, Lr), r(Xo, Z, n)
                }),
                Jo = sr(function(n, t, r) {
                    n[t] = r
                }, Ge(Ve)),
                Yo = sr(function(n, t, r) {
                    cu.call(n, t) ? n[t].push(r) : n[t] = [r]
                }, wr),
                Ho = le(dt),
                Qo = tr(function(n, t, r) {
                    Ot(n, t, r)
                }),
                Xo = tr(function(n, t, r, e) {
                    Ot(n, t, r, e)
                }),
                ni = le(function(n, t) {
                    return null == n ? {} : (t = a(ft(t), String), Et(n, ut(Ne(n), t)))
                }),
                ti = le(function(n, t) {
                    return null == n ? {} : Et(n, ft(t))
                }),
                ri = ir(function(n, t, r) {
                    return t = t.toLowerCase(), n + (r ? qe(t) : t)
                }),
                ei = ir(function(n, t, r) {
                    return n + (r ? "-" : "") + t.toLowerCase()
                }),
                ui = ir(function(n, t, r) {
                    return n + (r ? " " : "") + t.toLowerCase()
                }),
                oi = or("toLowerCase"),
                ii = or("toUpperCase"),
                fi = ir(function(n, t, r) {
                    return n + (r ? "_" : "") + t.toLowerCase()
                }),
                ci = ir(function(n, t, r) {
                    return n + (r ? " " : "") + qe(t)
                }),
                ai = ir(function(n, t, r) {
                    return n + (r ? " " : "") + t.toUpperCase()
                }),
                li = le(function(n, t) {
                    try {
                        return r(n, Z, t)
                    } catch (e) {
                        return xe(e) ? e : new tu(e)
                    }
                }),
                si = le(function(n, t) {
                    return u(ft(t), function(t) {
                        n[t] = Bo(n[t], n)
                    }), n
                }),
                hi = ar(),
                pi = ar(!0),
                _i = le(function(n, t) {
                    return function(r) {
                        return dt(r, n, t)
                    }
                }),
                gi = le(function(n, t) {
                    return function(r) {
                        return dt(n, r, t)
                    }
                }),
                vi = hr(a),
                di = hr(o),
                yi = hr(p),
                bi = gr(),
                xi = gr(!0),
                ji = dr("ceil"),
                mi = dr("floor"),
                wi = dr("round");
            return yn.prototype = mn.prototype, wn.prototype = Vu(mn.prototype), wn.prototype.constructor = wn, An.prototype = Vu(mn.prototype), An.prototype.constructor = An, Un.prototype = Fu ? Fu(null) : iu, zn.prototype.clear = function() {
                this.__data__ = {
                    hash: new Un,
                    map: Mu ? new Mu : [],
                    string: new Un
                }
            }, zn.prototype["delete"] = function(n) {
                var t = this.__data__;
                return Ur(n) ? (t = "string" == typeof n ? t.string : t.hash, (Fu ? t[n] !== Z : cu.call(t, n)) && delete t[n]) : Mu ? t.map["delete"](n) : Dn(t.map, n)
            }, zn.prototype.get = function(n) {
                var t = this.__data__;
                return Ur(n) ? (t = "string" == typeof n ? t.string : t.hash, Fu ? (n = t[n], n = "__lodash_hash_undefined__" === n ? Z : n) : n = cu.call(t, n) ? t[n] : Z, n) : Mu ? t.map.get(n) : Zn(t.map, n)
            }, zn.prototype.has = function(n) {
                var t = this.__data__;
                return Ur(n) ? (t = "string" == typeof n ? t.string : t.hash, n = Fu ? t[n] !== Z : cu.call(t, n)) : n = Mu ? t.map.has(n) : -1 < qn(t.map, n), n
            }, zn.prototype.set = function(n, t) {
                var r = this.__data__;
                return Ur(n) ? ("string" == typeof n ? r.string : r.hash)[n] = Fu && t === Z ? "__lodash_hash_undefined__" : t : Mu ? r.map.set(n, t) : Pn(r.map, n, t), this
            }, Mn.prototype.push = function(n) {
                var t = this.__data__;
                Ur(n) ? (t = t.__data__, ("string" == typeof n ? t.string : t.hash)[n] = "__lodash_hash_undefined__") : t.set(n, "__lodash_hash_undefined__")
            }, $n.prototype.clear = function() {
                this.__data__ = {
                    array: [],
                    map: null
                }
            }, $n.prototype["delete"] = function(n) {
                var t = this.__data__,
                    r = t.array;
                return r ? Dn(r, n) : t.map["delete"](n)
            }, $n.prototype.get = function(n) {
                var t = this.__data__,
                    r = t.array;
                return r ? Zn(r, n) : t.map.get(n)
            }, $n.prototype.has = function(n) {
                var t = this.__data__,
                    r = t.array;
                return r ? -1 < qn(r, n) : t.map.has(n)
            }, $n.prototype.set = function(n, t) {
                var r = this.__data__,
                    e = r.array;
                return e && (199 > e.length ? Pn(e, n, t) : (r.array = null, r.map = new zn(e))), (r = r.map) && r.set(n, t), this
            }, ae.Cache = zn, yn.after = function(n, t) {
                if ("function" != typeof t) throw new uu("Expected a function");
                return n = We(n),
                    function() {
                        return 1 > --n ? t.apply(this, arguments) : void 0
                    }
            }, yn.ary = ue, yn.assign = Zo, yn.assignIn = qo, yn.assignInWith = Po, yn.assignWith = To, yn.at = Ko, yn.before = oe, yn.bind = Bo, yn.bindAll = si, yn.bindKey = Co, yn.chain = Hr, yn.chunk = function(n, t) {
                t = Wu(We(t), 0);
                var r = n ? n.length : 0;
                if (!r || 1 > t) return [];
                for (var e = 0, u = -1, o = Array(ku(r / t)); r > e;) o[++u] = zt(n, e, e += t);
                return o
            }, yn.compact = function(n) {
                for (var t = -1, r = n ? n.length : 0, e = -1, u = []; ++t < r;) {
                    var o = n[t];
                    o && (u[++e] = o)
                }
                return u
            }, yn.concat = oo, yn.cond = function(n) {
                var t = n ? n.length : 0,
                    e = wr();
                return n = t ? a(n, function(n) {
                    if ("function" != typeof n[1]) throw new uu("Expected a function");
                    return [e(n[0]), n[1]]
                }) : [], le(function(e) {
                    for (var u = -1; ++u < t;) {
                        var o = n[u];
                        if (r(o[0], this, e)) return r(o[1], this, e)
                    }
                })
            }, yn.conforms = function(n) {
                return rt(tt(n, !0))
            }, yn.constant = Ge, yn.countBy = Oo, yn.create = function(n, t) {
                var r = Vu(n);
                return t ? Qn(r, t) : r
            }, yn.curry = ie, yn.curryRight = fe, yn.debounce = ce, yn.defaults = Go, yn.defaultsDeep = Vo, yn.defer = Uo, yn.delay = zo, yn.difference = io, yn.differenceBy = fo, yn.differenceWith = co, yn.drop = qr, yn.dropRight = Pr, yn.dropRightWhile = function(n, t) {
                return n && n.length ? Zt(n, wr(t, 3), !0, !0) : []
            }, yn.dropWhile = function(n, t) {
                return n && n.length ? Zt(n, wr(t, 3), !0) : []
            }, yn.fill = function(n, t, r, e) {
                var u = n ? n.length : 0;
                if (!u) return [];
                for (r && "number" != typeof r && Br(n, t, r) && (r = 0, e = u), u = n.length, r = We(r), 0 > r && (r = -r > u ? 0 : u + r), e = e === Z || e > u ? u : We(e), 0 > e && (e += u), e = r > e ? 0 : Be(e); e > r;) n[r++] = t;
                return n
            }, yn.filter = function(n, t) {
                return (No(n) ? i : it)(n, wr(t, 3))
            }, yn.flatMap = function(n, t) {
                return ft(re(n, t))
            }, yn.flatten = function(n) {
                return n && n.length ? ft(n) : []
            }, yn.flattenDeep = function(n) {
                return n && n.length ? ft(n, !0) : []
            }, yn.flip = function(n) {
                return yr(n, 512)
            }, yn.flow = hi, yn.flowRight = pi, yn.fromPairs = function(n) {
                for (var t = -1, r = n ? n.length : 0, e = {}; ++t < r;) {
                    var u = n[t];
                    e[u[0]] = u[1]
                }
                return e
            }, yn.functions = function(n) {
                return null == n ? [] : st(n, Fe(n))
            }, yn.functionsIn = function(n) {
                return null == n ? [] : st(n, Ne(n))
            }, yn.groupBy = ko, yn.initial = function(n) {
                return Pr(n, 1)
            }, yn.intersection = ao, yn.intersectionBy = lo, yn.intersectionWith = so, yn.invert = Jo, yn.invertBy = Yo, yn.invokeMap = Eo, yn.iteratee = Je, yn.keyBy = Io, yn.keys = Fe, yn.keysIn = Ne, yn.map = re, yn.mapKeys = function(n, t) {
                var r = {};
                return t = wr(t, 3), at(n, function(n, e, u) {
                    r[t(n, e, u)] = n
                }), r
            }, yn.mapValues = function(n, t) {
                var r = {};
                return t = wr(t, 3), at(n, function(n, e, u) {
                    r[e] = t(n, e, u)
                }), r
            }, yn.matches = function(n) {
                return wt(tt(n, !0))
            }, yn.matchesProperty = function(n, t) {
                return At(n, tt(t, !0))
            }, yn.memoize = ae, yn.merge = Qo, yn.mergeWith = Xo, yn.method = _i, yn.methodOf = gi, yn.mixin = Ye, yn.negate = function(n) {
                if ("function" != typeof n) throw new uu("Expected a function");
                return function() {
                    return !n.apply(this, arguments)
                }
            }, yn.nthArg = function(n) {
                return n = We(n),
                    function() {
                        return arguments[n]
                    }
            }, yn.omit = ni, yn.omitBy = function(n, t) {
                return t = wr(t, 2), It(n, function(n, r) {
                    return !t(n, r)
                })
            }, yn.once = function(n) {
                return oe(2, n)
            }, yn.orderBy = function(n, t, r, e) {
                return null == n ? [] : (No(t) || (t = null == t ? [] : [t]), r = e ? Z : r, No(r) || (r = null == r ? [] : [r]), kt(n, t, r))
            }, yn.over = vi, yn.overArgs = Mo, yn.overEvery = di, yn.overSome = yi, yn.partial = Lo, yn.partialRight = $o, yn.partition = So, yn.pick = ti, yn.pickBy = function(n, t) {
                return null == n ? {} : It(n, wr(t, 2))
            }, yn.property = Qe, yn.propertyOf = function(n) {
                return function(t) {
                    return null == n ? Z : ht(n, t)
                }
            }, yn.pull = ho, yn.pullAll = Gr, yn.pullAllBy = function(n, t, r) {
                return n && n.length && t && t.length ? Wt(n, t, wr(r)) : n
            }, yn.pullAt = po, yn.range = bi, yn.rangeRight = xi, yn.rearg = Fo, yn.reject = function(n, t) {
                var r = No(n) ? i : it;
                return t = wr(t, 3), r(n, function(n, r, e) {
                    return !t(n, r, e)
                })
            }, yn.remove = function(n, t) {
                var r = [];
                if (!n || !n.length) return r;
                var e = -1,
                    u = [],
                    o = n.length;
                for (t = wr(t, 3); ++e < o;) {
                    var i = n[e];
                    t(i, e, n) && (r.push(i), u.push(e))
                }
                return Bt(n, u), r
            }, yn.rest = le, yn.reverse = Vr, yn.sampleSize = ee, yn.set = function(n, t, r) {
                return null == n ? n : Ut(n, t, r)
            }, yn.setWith = function(n, t, r, e) {
                return e = "function" == typeof e ? e : Z, null == n ? n : Ut(n, t, r, e)
            }, yn.shuffle = function(n) {
                return ee(n, 4294967295)
            }, yn.slice = function(n, t, r) {
                var e = n ? n.length : 0;
                return e ? (r && "number" != typeof r && Br(n, t, r) ? (t = 0, r = e) : (t = null == t ? 0 : We(t), r = r === Z ? e : We(r)), zt(n, t, r)) : []
            }, yn.sortBy = Ro, yn.sortedUniq = function(n) {
                return n && n.length ? Ft(n) : []
            }, yn.sortedUniqBy = function(n, t) {
                return n && n.length ? Ft(n, wr(t)) : []
            }, yn.split = function(n, t, r) {
                return ze(n).split(t, r)
            }, yn.spread = function(n, t) {
                if ("function" != typeof n) throw new uu("Expected a function");
                return t = t === Z ? 0 : Wu(We(t), 0), le(function(e) {
                    var u = e[t];
                    return e = e.slice(0, t), u && l(e, u), r(n, this, e)
                })
            }, yn.tail = function(n) {
                return qr(n, 1)
            }, yn.take = function(n, t, r) {
                return n && n.length ? (t = r || t === Z ? 1 : We(t), zt(n, 0, 0 > t ? 0 : t)) : []
            }, yn.takeRight = function(n, t, r) {
                var e = n ? n.length : 0;
                return e ? (t = r || t === Z ? 1 : We(t), t = e - t, zt(n, 0 > t ? 0 : t, e)) : []
            }, yn.takeRightWhile = function(n, t) {
                return n && n.length ? Zt(n, wr(t, 3), !1, !0) : []
            }, yn.takeWhile = function(n, t) {
                return n && n.length ? Zt(n, wr(t, 3)) : []
            }, yn.tap = function(n, t) {
                return t(n), n
            }, yn.throttle = function(n, t, r) {
                var e = !0,
                    u = !0;
                if ("function" != typeof n) throw new uu("Expected a function");
                return xe(r) && (e = "leading" in r ? !!r.leading : e, u = "trailing" in r ? !!r.trailing : u), ce(n, t, {
                    leading: e,
                    maxWait: t,
                    trailing: u
                })
            }, yn.thru = Qr, yn.toArray = Re, yn.toPairs = De, yn.toPairsIn = function(n) {
                return m(n, Ne(n))
            }, yn.toPath = function(n) {
                return No(n) ? a(n, String) : Fr(n)
            }, yn.toPlainObject = Ue, yn.transform = function(n, t, r) {
                var e = No(n) || Ie(n);
                if (t = wr(t, 4), null == r)
                    if (e || xe(n)) {
                        var o = n.constructor;
                        r = e ? No(n) ? new o : [] : Vu(de(o) ? o.prototype : Z)
                    } else r = {};
                return (e ? u : at)(n, function(n, e, u) {
                    return t(r, n, e, u)
                }), r
            }, yn.unary = function(n) {
                return ue(n, 1)
            }, yn.union = _o, yn.unionBy = go, yn.unionWith = vo, yn.uniq = function(n) {
                return n && n.length ? Dt(n) : []
            }, yn.uniqBy = function(n, t) {
                return n && n.length ? Dt(n, wr(t)) : []
            }, yn.uniqWith = function(n, t) {
                return n && n.length ? Dt(n, Z, t) : []
            }, yn.unset = function(n, t) {
                var r;
                if (null == n) r = !0;
                else {
                    r = n;
                    var e = t,
                        e = Cr(e, r) ? [e + ""] : Nt(e);
                    r = $r(r, e), e = Kr(e), r = null == r || !Le(r, e) || delete r[e]
                }
                return r
            }, yn.unzip = Jr, yn.unzipWith = Yr, yn.values = Ze, yn.valuesIn = function(n) {
                return null == n ? A(n, Ne(n)) : []
            }, yn.without = yo, yn.words = Ke, yn.wrap = function(n, t) {
                return t = null == t ? Ve : t, Lo(t, n)
            }, yn.xor = bo, yn.xorBy = xo, yn.xorWith = jo, yn.zip = mo, yn.zipObject = function(n, t) {
                return Tt(n || [], t || [], Yn)
            }, yn.zipObjectDeep = function(n, t) {
                return Tt(n || [], t || [], Ut)
            }, yn.zipWith = wo, yn.extend = qo, yn.extendWith = Po, Ye(yn, yn), yn.add = function(n, t) {
                var r;
                return n === Z && t === Z ? 0 : (n !== Z && (r = n), t !== Z && (r = r === Z ? t : r + t), r)
            }, yn.attempt = li, yn.camelCase = ri, yn.capitalize = qe, yn.ceil = ji, yn.clamp = function(n, t, r) {
                return r === Z && (r = t, t = Z), r !== Z && (r = Ce(r), r = r === r ? r : 0), t !== Z && (t = Ce(t), t = t === t ? t : 0), nt(Ce(n), t, r)
            }, yn.clone = function(n) {
                return tt(n)
            }, yn.cloneDeep = function(n) {
                return tt(n, !0)
            }, yn.cloneDeepWith = function(n, t) {
                return tt(n, !0, t)
            }, yn.cloneWith = function(n, t) {
                return tt(n, !1, t)
            }, yn.deburr = Pe, yn.endsWith = function(n, t, r) {
                n = ze(n), t = "string" == typeof t ? t : t + "";
                var e = n.length;
                return r = r === Z ? e : nt(We(r), 0, e), r -= t.length, r >= 0 && n.indexOf(t, r) == r
            }, yn.eq = se, yn.escape = function(n) {
                return (n = ze(n)) && H.test(n) ? n.replace(J, R) : n
            }, yn.escapeRegExp = function(n) {
                return (n = ze(n)) && on.test(n) ? n.replace(un, "\\$&") : n
            }, yn.every = function(n, t, r) {
                var e = No(n) ? o : ot;
                return r && Br(n, t, r) && (t = Z), e(n, wr(t, 3))
            }, yn.find = function(n, t) {
                if (t = wr(t, 3), No(n)) {
                    var r = v(n, t);
                    return r > -1 ? n[r] : Z
                }
                return g(n, t, Ju)
            }, yn.findIndex = function(n, t) {
                return n && n.length ? v(n, wr(t, 3)) : -1
            }, yn.findKey = function(n, t) {
                return g(n, wr(t, 3), at, !0)
            }, yn.findLast = function(n, t) {
                if (t = wr(t, 3), No(n)) {
                    var r = v(n, t, !0);
                    return r > -1 ? n[r] : Z
                }
                return g(n, t, Yu)
            }, yn.findLastIndex = function(n, t) {
                return n && n.length ? v(n, wr(t, 3), !0) : -1
            }, yn.findLastKey = function(n, t) {
                return g(n, wr(t, 3), lt, !0)
            }, yn.floor = mi, yn.forEach = ne, yn.forEachRight = te, yn.forIn = function(n, t) {
                return null == n ? n : Hu(n, Dr(t), Ne)
            }, yn.forInRight = function(n, t) {
                return null == n ? n : Qu(n, Dr(t), Ne)
            }, yn.forOwn = function(n, t) {
                return n && at(n, Dr(t))
            }, yn.forOwnRight = function(n, t) {
                return n && lt(n, Dr(t))
            }, yn.get = Me, yn.gt = he, yn.gte = function(n, t) {
                return n >= t
            }, yn.has = Le, yn.hasIn = $e, yn.head = Tr, yn.identity = Ve, yn.includes = function(n, t, r, e) {
                return n = _e(n) ? n : Ze(n), r = r && !e ? We(r) : 0, e = n.length, 0 > r && (r = Wu(e + r, 0)), ke(n) ? e >= r && -1 < n.indexOf(t, r) : !!e && -1 < d(n, t, r)
            }, yn.indexOf = function(n, t, r) {
                var e = n ? n.length : 0;
                return e ? (r = We(r), 0 > r && (r = Wu(e + r, 0)), d(n, t, r)) : -1
            }, yn.inRange = function(n, t, r) {
                return t = Ce(t) || 0, r === Z ? (r = t, t = 0) : r = Ce(r) || 0, n = Ce(n), n >= Bu(t, r) && n < Wu(t, r)
            }, yn.invoke = Ho, yn.isArguments = pe, yn.isArray = No, yn.isArrayBuffer = function(n) {
                return je(n) && "[object ArrayBuffer]" == su.call(n)
            }, yn.isArrayLike = _e, yn.isArrayLikeObject = ge, yn.isBoolean = function(n) {
                return !0 === n || !1 === n || je(n) && "[object Boolean]" == su.call(n)
            }, yn.isBuffer = Do, yn.isDate = function(n) {
                return je(n) && "[object Date]" == su.call(n)
            }, yn.isElement = function(n) {
                return !!n && 1 === n.nodeType && je(n) && !Ae(n)
            }, yn.isEmpty = function(n) {
                if (_e(n) && (No(n) || ke(n) || de(n.splice) || pe(n))) return !n.length;
                for (var t in n)
                    if (cu.call(n, t)) return !1;
                return !0
            }, yn.isEqual = function(n, t) {
                return yt(n, t)
            }, yn.isEqualWith = function(n, t, r) {
                var e = (r = "function" == typeof r ? r : Z) ? r(n, t) : Z;
                return e === Z ? yt(n, t, r) : !!e
            }, yn.isError = ve, yn.isFinite = function(n) {
                return "number" == typeof n && Iu(n)
            }, yn.isFunction = de, yn.isInteger = ye, yn.isLength = be, yn.isMap = function(n) {
                return je(n) && "[object Map]" == kr(n)
            }, yn.isMatch = function(n, t) {
                return n === t || bt(n, t, Ar(t))
            }, yn.isMatchWith = function(n, t, r) {
                return r = "function" == typeof r ? r : Z, bt(n, t, Ar(t), r)
            }, yn.isNaN = function(n) {
                return we(n) && n != +n
            }, yn.isNative = me, yn.isNil = function(n) {
                return null == n
            }, yn.isNull = function(n) {
                return null === n
            }, yn.isNumber = we, yn.isObject = xe, yn.isObjectLike = je, yn.isPlainObject = Ae, yn.isRegExp = Oe, yn.isSafeInteger = function(n) {
                return ye(n) && n >= -9007199254740991 && 9007199254740991 >= n
            }, yn.isSet = function(n) {
                return je(n) && "[object Set]" == kr(n)
            }, yn.isString = ke, yn.isSymbol = Ee, yn.isTypedArray = Ie, yn.isUndefined = function(n) {
                return n === Z
            }, yn.isWeakMap = function(n) {
                return je(n) && "[object WeakMap]" == kr(n)
            }, yn.isWeakSet = function(n) {
                return je(n) && "[object WeakSet]" == su.call(n)
            }, yn.join = function(n, t) {
                return n ? Su.call(n, t) : ""
            }, yn.kebabCase = ei, yn.last = Kr, yn.lastIndexOf = function(n, t, r) {
                var e = n ? n.length : 0;
                if (!e) return -1;
                var u = e;
                if (r !== Z && (u = We(r), u = (0 > u ? Wu(e + u, 0) : Bu(u, e - 1)) + 1), t !== t) return B(n, u, !0);
                for (; u--;)
                    if (n[u] === t) return u;
                return -1
            }, yn.lowerCase = ui, yn.lowerFirst = oi, yn.lt = Se, yn.lte = function(n, t) {
                return t >= n
            }, yn.max = function(n) {
                return n && n.length ? _(n, Ve, he) : Z
            }, yn.maxBy = function(n, t) {
                return n && n.length ? _(n, wr(t), he) : Z
            }, yn.mean = function(n) {
                return Xe(n) / (n ? n.length : 0)
            }, yn.min = function(n) {
                return n && n.length ? _(n, Ve, Se) : Z
            }, yn.minBy = function(n, t) {
                return n && n.length ? _(n, wr(t), Se) : Z
            }, yn.noConflict = function() {
                return Vn._ === this && (Vn._ = hu), this
            }, yn.noop = He, yn.now = Wo, yn.pad = function(n, t, r) {
                n = ze(n), t = We(t);
                var e = F(n);
                return t && t > e ? (e = (t - e) / 2, t = Eu(e), e = ku(e), pr("", t, r) + n + pr("", e, r)) : n
            }, yn.padEnd = function(n, t, r) {
                return n = ze(n), n + pr(n, t, r)
            }, yn.padStart = function(n, t, r) {
                return n = ze(n), pr(n, t, r) + n
            }, yn.parseInt = function(n, t, r) {
                return r || null == t ? t = 0 : t && (t = +t), n = ze(n).replace(fn, ""), Cu(n, t || (pn.test(n) ? 16 : 10))
            }, yn.random = function(n, t, r) {
                if (r && "boolean" != typeof r && Br(n, t, r) && (t = r = Z), r === Z && ("boolean" == typeof t ? (r = t, t = Z) : "boolean" == typeof n && (r = n, n = Z)), n === Z && t === Z ? (n = 0, t = 1) : (n = Ce(n) || 0, t === Z ? (t = n, n = 0) : t = Ce(t) || 0), n > t) {
                    var e = n;
                    n = t, t = e
                }
                return r || n % 1 || t % 1 ? (r = Uu(), Bu(n + r * (t - n + Fn("1e-" + ((r + "").length - 1))), t)) : Ct(n, t)
            }, yn.reduce = function(n, t, r) {
                var e = No(n) ? s : y,
                    u = 3 > arguments.length;
                return e(n, wr(t, 4), r, u, Ju)
            }, yn.reduceRight = function(n, t, r) {
                var e = No(n) ? h : y,
                    u = 3 > arguments.length;
                return e(n, wr(t, 4), r, u, Yu)
            }, yn.repeat = Te, yn.replace = function() {
                var n = arguments,
                    t = ze(n[0]);
                return 3 > n.length ? t : t.replace(n[1], n[2])
            }, yn.result = function(n, t, r) {
                if (Cr(t, n)) e = null == n ? Z : n[t];
                else {
                    t = Nt(t);
                    var e = Me(n, t);
                    n = $r(n, t)
                }
                return e === Z && (e = r), de(e) ? e.call(n) : e
            }, yn.round = wi, yn.runInContext = D, yn.sample = function(n) {
                n = _e(n) ? n : Ze(n);
                var t = n.length;
                return t > 0 ? n[Ct(0, t - 1)] : Z
            }, yn.size = function(n) {
                if (null == n) return 0;
                if (_e(n)) {
                    var t = n.length;
                    return t && ke(n) ? F(n) : t
                }
                return Fe(n).length
            }, yn.snakeCase = fi, yn.some = function(n, t, r) {
                var e = No(n) ? p : Mt;
                return r && Br(n, t, r) && (t = Z), e(n, wr(t, 3))
            }, yn.sortedIndex = function(n, t) {
                return Lt(n, t)
            }, yn.sortedIndexBy = function(n, t, r) {
                return $t(n, t, wr(r))
            }, yn.sortedIndexOf = function(n, t) {
                var r = n ? n.length : 0;
                if (r) {
                    var e = Lt(n, t);
                    if (r > e && se(n[e], t)) return e
                }
                return -1
            }, yn.sortedLastIndex = function(n, t) {
                return Lt(n, t, !0)
            }, yn.sortedLastIndexBy = function(n, t, r) {
                return $t(n, t, wr(r), !0)
            }, yn.sortedLastIndexOf = function(n, t) {
                if (n && n.length) {
                    var r = Lt(n, t, !0) - 1;
                    if (se(n[r], t)) return r
                }
                return -1
            }, yn.startCase = ci, yn.startsWith = function(n, t, r) {
                return n = ze(n), r = nt(We(r), 0, n.length), n.lastIndexOf(t, r) == r
            }, yn.subtract = function(n, t) {
                var r;
                return n === Z && t === Z ? 0 : (n !== Z && (r = n), t !== Z && (r = r === Z ? t : r - t), r)
            }, yn.sum = Xe, yn.sumBy = function(n, t) {
                return n && n.length ? x(n, wr(t)) : 0
            }, yn.template = function(n, t, r) {
                var e = yn.templateSettings;
                r && Br(n, t, r) && (t = Z), n = ze(n), t = Po({}, t, e, Tn), r = Po({}, t.imports, e.imports, Tn);
                var u, o, i = Fe(r),
                    f = A(r, i),
                    c = 0;
                r = t.interpolate || xn;
                var a = "__p+='";
                r = eu((t.escape || xn).source + "|" + r.source + "|" + (r === nn ? sn : xn).source + "|" + (t.evaluate || xn).source + "|$", "g");
                var l = "sourceURL" in t ? "//# sourceURL=" + t.sourceURL + "\n" : "";
                if (n.replace(r, function(t, r, e, i, f, l) {
                        return e || (e = i), a += n.slice(c, l).replace(jn, W), r && (u = !0, a += "'+__e(" + r + ")+'"), f && (o = !0, a += "';" + f + ";\n__p+='"), e && (a += "'+((__t=(" + e + "))==null?'':__t)+'"), c = l + t.length, t
                    }), a += "';", (t = t.variable) || (a = "with(obj){" + a + "}"), a = (o ? a.replace(T, "") : a).replace(K, "$1").replace(G, "$1;"), a = "function(" + (t || "obj") + "){" + (t ? "" : "obj||(obj={});") + "var __t,__p=''" + (u ? ",__e=_.escape" : "") + (o ? ",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}" : ";") + a + "return __p}", t = li(function() {
                        return Function(i, l + "return " + a).apply(Z, f)
                    }), t.source = a, ve(t)) throw t;
                return t
            }, yn.times = function(n, t) {
                if (n = We(n), 1 > n || n > 9007199254740991) return [];
                var r = 4294967295,
                    e = Bu(n, 4294967295);
                for (t = Dr(t), n -= 4294967295, e = j(e, t); ++r < n;) t(r);
                return e
            }, yn.toInteger = We, yn.toLength = Be, yn.toLower = function(n) {
                return ze(n).toLowerCase()
            }, yn.toNumber = Ce, yn.toSafeInteger = function(n) {
                return nt(We(n), -9007199254740991, 9007199254740991)
            }, yn.toString = ze, yn.toUpper = function(n) {
                return ze(n).toUpperCase()
            }, yn.trim = function(n, t, r) {
                return (n = ze(n)) ? r || t === Z ? n.replace(fn, "") : (t += "") ? (n = n.match(kn), t = t.match(kn), n.slice(O(n, t), k(n, t) + 1).join("")) : n : n
            }, yn.trimEnd = function(n, t, r) {
                return (n = ze(n)) ? r || t === Z ? n.replace(an, "") : (t += "") ? (n = n.match(kn), n.slice(0, k(n, t.match(kn)) + 1).join("")) : n : n
            }, yn.trimStart = function(n, t, r) {
                return (n = ze(n)) ? r || t === Z ? n.replace(cn, "") : (t += "") ? (n = n.match(kn), n.slice(O(n, t.match(kn))).join("")) : n : n
            }, yn.truncate = function(n, t) {
                var r = 30,
                    e = "...";
                if (xe(t)) var u = "separator" in t ? t.separator : u,
                    r = "length" in t ? We(t.length) : r,
                    e = "omission" in t ? ze(t.omission) : e;
                n = ze(n);
                var o = n.length;
                if (En.test(n)) var i = n.match(kn),
                    o = i.length;
                if (r >= o) return n;
                if (o = r - F(e), 1 > o) return e;
                if (r = i ? i.slice(0, o).join("") : n.slice(0, o), u === Z) return r + e;
                if (i && (o += r.length - o), Oe(u)) {
                    if (n.slice(o).search(u)) {
                        var f = r;
                        for (u.global || (u = eu(u.source, ze(hn.exec(u)) + "g")), u.lastIndex = 0; i = u.exec(f);) var c = i.index;
                        r = r.slice(0, c === Z ? o : c)
                    }
                } else n.indexOf(u, o) != o && (u = r.lastIndexOf(u), u > -1 && (r = r.slice(0, u)));
                return r + e
            }, yn.unescape = function(n) {
                return (n = ze(n)) && Y.test(n) ? n.replace(V, N) : n
            }, yn.uniqueId = function(n) {
                var t = ++au;
                return ze(n) + t
            }, yn.upperCase = ai, yn.upperFirst = ii, yn.each = ne, yn.eachRight = te, yn.first = Tr, Ye(yn, function() {
                var n = {};
                return at(yn, function(t, r) {
                    cu.call(yn.prototype, r) || (n[r] = t)
                }), n
            }(), {
                chain: !1
            }), yn.VERSION = "4.3.0", u("bind bindKey curry curryRight partial partialRight".split(" "), function(n) {
                yn[n].placeholder = yn
            }), u(["drop", "take"], function(n, t) {
                An.prototype[n] = function(r) {
                    var e = this.__filtered__;
                    if (e && !t) return new An(this);
                    r = r === Z ? 1 : Wu(We(r), 0);
                    var u = this.clone();
                    return e ? u.__takeCount__ = Bu(r, u.__takeCount__) : u.__views__.push({
                        size: Bu(r, 4294967295),
                        type: n + (0 > u.__dir__ ? "Right" : "")
                    }), u
                }, An.prototype[n + "Right"] = function(t) {
                    return this.reverse()[n](t).reverse()
                }
            }), u(["filter", "map", "takeWhile"], function(n, t) {
                var r = t + 1,
                    e = 1 == r || 3 == r;
                An.prototype[n] = function(n) {
                    var t = this.clone();
                    return t.__iteratees__.push({
                        iteratee: wr(n, 3),
                        type: r
                    }), t.__filtered__ = t.__filtered__ || e, t
                }
            }), u(["head", "last"], function(n, t) {
                var r = "take" + (t ? "Right" : "");
                An.prototype[n] = function() {
                    return this[r](1).value()[0]
                }
            }), u(["initial", "tail"], function(n, t) {
                var r = "drop" + (t ? "" : "Right");
                An.prototype[n] = function() {
                    return this.__filtered__ ? new An(this) : this[r](1)
                }
            }), An.prototype.compact = function() {
                return this.filter(Ve)
            }, An.prototype.find = function(n) {
                return this.filter(n).head()
            }, An.prototype.findLast = function(n) {
                return this.reverse().find(n)
            }, An.prototype.invokeMap = le(function(n, t) {
                return "function" == typeof n ? new An(this) : this.map(function(r) {
                    return dt(r, n, t)
                })
            }), An.prototype.reject = function(n) {
                return n = wr(n, 3), this.filter(function(t) {
                    return !n(t)
                })
            }, An.prototype.slice = function(n, t) {
                n = We(n);
                var r = this;
                return r.__filtered__ && (n > 0 || 0 > t) ? new An(r) : (0 > n ? r = r.takeRight(-n) : n && (r = r.drop(n)), t !== Z && (t = We(t), r = 0 > t ? r.dropRight(-t) : r.take(t - n)), r)
            }, An.prototype.takeRightWhile = function(n) {
                return this.reverse().takeWhile(n).reverse()
            }, An.prototype.toArray = function() {
                return this.take(4294967295)
            }, at(An.prototype, function(n, t) {
                var r = /^(?:filter|find|map|reject)|While$/.test(t),
                    e = /^(?:head|last)$/.test(t),
                    u = yn[e ? "take" + ("last" == t ? "Right" : "") : t],
                    o = e || /^find/.test(t);
                u && (yn.prototype[t] = function() {
                    var t = this.__wrapped__,
                        i = e ? [1] : arguments,
                        f = t instanceof An,
                        c = i[0],
                        a = f || No(t),
                        s = function(n) {
                            return n = u.apply(yn, l([n], i)), e && h ? n[0] : n
                        };
                    a && r && "function" == typeof c && 1 != c.length && (f = a = !1);
                    var h = this.__chain__,
                        p = !!this.__actions__.length,
                        c = o && !h,
                        f = f && !p;
                    return !o && a ? (t = f ? t : new An(this), t = n.apply(t, i), t.__actions__.push({
                        func: Qr,
                        args: [s],
                        thisArg: Z
                    }), new wn(t, h)) : c && f ? n.apply(this, i) : (t = this.thru(s), c ? e ? t.value()[0] : t.value() : t)
                })
            }), u("pop push shift sort splice unshift".split(" "), function(n) {
                var t = ou[n],
                    r = /^(?:push|sort|unshift)$/.test(n) ? "tap" : "thru",
                    e = /^(?:pop|shift)$/.test(n);
                yn.prototype[n] = function() {
                    var n = arguments;
                    return e && !this.__chain__ ? t.apply(this.value(), n) : this[r](function(r) {
                        return t.apply(r, n)
                    })
                }
            }), at(An.prototype, function(n, t) {
                var r = yn[t];
                if (r) {
                    var e = r.name + "";
                    (Gu[e] || (Gu[e] = [])).push({
                        name: t,
                        func: r
                    })
                }
            }), Gu[lr(Z, 2).name] = [{
                name: "wrapper",
                func: Z
            }], An.prototype.clone = function() {
                var n = new An(this.__wrapped__);
                return n.__actions__ = Yt(this.__actions__), n.__dir__ = this.__dir__, n.__filtered__ = this.__filtered__, n.__iteratees__ = Yt(this.__iteratees__), n.__takeCount__ = this.__takeCount__, n.__views__ = Yt(this.__views__), n
            }, An.prototype.reverse = function() {
                if (this.__filtered__) {
                    var n = new An(this);
                    n.__dir__ = -1, n.__filtered__ = !0
                } else n = this.clone(), n.__dir__ *= -1;
                return n
            }, An.prototype.value = function() {
                var n, t = this.__wrapped__.value(),
                    r = this.__dir__,
                    e = No(t),
                    u = 0 > r,
                    o = e ? t.length : 0;
                n = 0;
                for (var i = o, f = this.__views__, c = -1, a = f.length; ++c < a;) {
                    var l = f[c],
                        s = l.size;
                    switch (l.type) {
                        case "drop":
                            n += s;
                            break;
                        case "dropRight":
                            i -= s;
                            break;
                        case "take":
                            i = Bu(i, n + s);
                            break;
                        case "takeRight":
                            n = Wu(n, i - s)
                    }
                }
                if (n = {
                        start: n,
                        end: i
                    }, i = n.start, f = n.end, n = f - i, u = u ? f : i - 1, i = this.__iteratees__, f = i.length, c = 0, a = Bu(n, this.__takeCount__), !e || 200 > o || o == n && a == n) return qt(t, this.__actions__);
                e = [];
                n: for (; n-- && a > c;) {
                    for (u += r, o = -1, l = t[u]; ++o < f;) {
                        var h = i[o],
                            s = h.type,
                            h = (0, h.iteratee)(l);
                        if (2 == s) l = h;
                        else if (!h) {
                            if (1 == s) continue n;
                            break n
                        }
                    }
                    e[c++] = l
                }
                return e
            }, yn.prototype.at = Ao, yn.prototype.chain = function() {
                return Hr(this)
            }, yn.prototype.commit = function() {
                return new wn(this.value(), this.__chain__)
            }, yn.prototype.flatMap = function(n) {
                return this.map(n).flatten()
            }, yn.prototype.next = function() {
                this.__values__ === Z && (this.__values__ = Re(this.value()));
                var n = this.__index__ >= this.__values__.length,
                    t = n ? Z : this.__values__[this.__index__++];
                return {
                    done: n,
                    value: t
                }
            }, yn.prototype.plant = function(n) {
                for (var t, r = this; r instanceof mn;) {
                    var e = Zr(r);
                    e.__index__ = 0, e.__values__ = Z, t ? u.__wrapped__ = e : t = e;
                    var u = e,
                        r = r.__wrapped__
                }
                return u.__wrapped__ = n, t
            }, yn.prototype.reverse = function() {
                var n = this.__wrapped__;
                return n instanceof An ? (this.__actions__.length && (n = new An(this)), n = n.reverse(), n.__actions__.push({
                    func: Qr,
                    args: [Vr],
                    thisArg: Z
                }), new wn(n, this.__chain__)) : this.thru(Vr)
            }, yn.prototype.toJSON = yn.prototype.valueOf = yn.prototype.value = function() {
                return qt(this.__wrapped__, this.__actions__)
            }, mu && (yn.prototype[mu] = Xr), yn
        }
        var Z, q = 1 / 0,
            P = NaN,
            T = /\b__p\+='';/g,
            K = /\b(__p\+=)''\+/g,
            G = /(__e\(.*?\)|\b__t\))\+'';/g,
            V = /&(?:amp|lt|gt|quot|#39|#96);/g,
            J = /[&<>"'`]/g,
            Y = RegExp(V.source),
            H = RegExp(J.source),
            Q = /<%-([\s\S]+?)%>/g,
            X = /<%([\s\S]+?)%>/g,
            nn = /<%=([\s\S]+?)%>/g,
            tn = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
            rn = /^\w*$/,
            en = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g,
            un = /[\\^$.*+?()[\]{}|]/g,
            on = RegExp(un.source),
            fn = /^\s+|\s+$/g,
            cn = /^\s+/,
            an = /\s+$/,
            ln = /\\(\\)?/g,
            sn = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,
            hn = /\w*$/,
            pn = /^0x/i,
            _n = /^[-+]0x[0-9a-f]+$/i,
            gn = /^0b[01]+$/i,
            vn = /^\[object .+?Constructor\]$/,
            dn = /^0o[0-7]+$/i,
            yn = /^(?:0|[1-9]\d*)$/,
            bn = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g,
            xn = /($^)/,
            jn = /['\n\r\u2028\u2029\\]/g,
            mn = "[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0]|\\ud83c[\\udffb-\\udfff])?(?:\\u200d(?:[^\\ud800-\\udfff]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0]|\\ud83c[\\udffb-\\udfff])?)*",
            wn = "(?:[\\u2700-\\u27bf]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])" + mn,
            An = "(?:[^\\ud800-\\udfff][\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0]?|[\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\ud800-\\udfff])",
            On = RegExp("[\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0]", "g"),
            kn = RegExp("\\ud83c[\\udffb-\\udfff](?=\\ud83c[\\udffb-\\udfff])|" + An + mn, "g"),
            En = RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe23\\u20d0-\\u20f0\\ufe0e\\ufe0f]"),
            In = /[a-zA-Z0-9]+/g,
            Sn = RegExp(["[A-Z\\xc0-\\xd6\\xd8-\\xde]?[a-z\\xdf-\\xf6\\xf8-\\xff]+(?=[\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2018\\u2019\\u201c\\u201d \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000]|[A-Z\\xc0-\\xd6\\xd8-\\xde]|$)|(?:[A-Z\\xc0-\\xd6\\xd8-\\xde]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2018\\u2019\\u201c\\u201d \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+(?=[\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2018\\u2019\\u201c\\u201d \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000]|[A-Z\\xc0-\\xd6\\xd8-\\xde](?:[a-z\\xdf-\\xf6\\xf8-\\xff]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2018\\u2019\\u201c\\u201d \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])|$)|[A-Z\\xc0-\\xd6\\xd8-\\xde]?(?:[a-z\\xdf-\\xf6\\xf8-\\xff]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2018\\u2019\\u201c\\u201d \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+|[A-Z\\xc0-\\xd6\\xd8-\\xde]+|\\d+", wn].join("|"), "g"),
            Rn = /[a-z][A-Z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
            Wn = "Array Buffer Date Error Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Math Object Reflect RegExp Set String Symbol TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array WeakMap _ clearTimeout isFinite parseInt setTimeout".split(" "),
            Bn = {};
        Bn["[object Float32Array]"] = Bn["[object Float64Array]"] = Bn["[object Int8Array]"] = Bn["[object Int16Array]"] = Bn["[object Int32Array]"] = Bn["[object Uint8Array]"] = Bn["[object Uint8ClampedArray]"] = Bn["[object Uint16Array]"] = Bn["[object Uint32Array]"] = !0, Bn["[object Arguments]"] = Bn["[object Array]"] = Bn["[object ArrayBuffer]"] = Bn["[object Boolean]"] = Bn["[object Date]"] = Bn["[object Error]"] = Bn["[object Function]"] = Bn["[object Map]"] = Bn["[object Number]"] = Bn["[object Object]"] = Bn["[object RegExp]"] = Bn["[object Set]"] = Bn["[object String]"] = Bn["[object WeakMap]"] = !1;
        var Cn = {};
        Cn["[object Arguments]"] = Cn["[object Array]"] = Cn["[object ArrayBuffer]"] = Cn["[object Boolean]"] = Cn["[object Date]"] = Cn["[object Float32Array]"] = Cn["[object Float64Array]"] = Cn["[object Int8Array]"] = Cn["[object Int16Array]"] = Cn["[object Int32Array]"] = Cn["[object Map]"] = Cn["[object Number]"] = Cn["[object Object]"] = Cn["[object RegExp]"] = Cn["[object Set]"] = Cn["[object String]"] = Cn["[object Symbol]"] = Cn["[object Uint8Array]"] = Cn["[object Uint8ClampedArray]"] = Cn["[object Uint16Array]"] = Cn["[object Uint32Array]"] = !0, Cn["[object Error]"] = Cn["[object Function]"] = Cn["[object WeakMap]"] = !1;
        var Un = {
                "À": "A",
                "Á": "A",
                "Â": "A",
                "Ã": "A",
                "Ä": "A",
                "Å": "A",
                "à": "a",
                "á": "a",
                "â": "a",
                "ã": "a",
                "ä": "a",
                "å": "a",
                "Ç": "C",
                "ç": "c",
                "Ð": "D",
                "ð": "d",
                "È": "E",
                "É": "E",
                "Ê": "E",
                "Ë": "E",
                "è": "e",
                "é": "e",
                "ê": "e",
                "ë": "e",
                "Ì": "I",
                "Í": "I",
                "Î": "I",
                "Ï": "I",
                "ì": "i",
                "í": "i",
                "î": "i",
                "ï": "i",
                "Ñ": "N",
                "ñ": "n",
                "Ò": "O",
                "Ó": "O",
                "Ô": "O",
                "Õ": "O",
                "Ö": "O",
                "Ø": "O",
                "ò": "o",
                "ó": "o",
                "ô": "o",
                "õ": "o",
                "ö": "o",
                "ø": "o",
                "Ù": "U",
                "Ú": "U",
                "Û": "U",
                "Ü": "U",
                "ù": "u",
                "ú": "u",
                "û": "u",
                "ü": "u",
                "Ý": "Y",
                "ý": "y",
                "ÿ": "y",
                "Æ": "Ae",
                "æ": "ae",
                "Þ": "Th",
                "þ": "th",
                "ß": "ss"
            },
            zn = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
                "`": "&#96;"
            },
            Mn = {
                "&amp;": "&",
                "&lt;": "<",
                "&gt;": ">",
                "&quot;": '"',
                "&#39;": "'",
                "&#96;": "`"
            },
            Ln = {
                "function": !0,
                object: !0
            },
            $n = {
                "\\": "\\",
                "'": "'",
                "\n": "n",
                "\r": "r",
                "\u2028": "u2028",
                "\u2029": "u2029"
            },
            Fn = parseFloat,
            Nn = parseInt,
            Dn = Ln[typeof exports] && exports && !exports.nodeType ? exports : null,
            Zn = Ln[typeof module] && module && !module.nodeType ? module : null,
            qn = E(Dn && Zn && "object" == typeof global && global),
            Pn = E(Ln[typeof self] && self),
            Tn = E(Ln[typeof window] && window),
            Kn = Zn && Zn.exports === Dn ? Dn : null,
            Gn = E(Ln[typeof this] && this),
            Vn = qn || Tn !== (Gn && Gn.window) && Tn || Pn || Gn || Function("return this")(),
            Jn = D();
        (Tn || Pn || {})._ = Jn, "function" == typeof define && "object" == typeof define.amd && define.amd ? define(function() {
            return Jn
        }) : Dn && Zn ? (Kn && ((Zn.exports = Jn)._ = Jn), Dn._ = Jn) : Vn._ = Jn
    }.call(this);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.Util = Bahmni.Common.Util || {}, angular.module("bahmni.common.util", []).provider("$bahmniCookieStore", [function() {
    var self = this;
    self.defaultOptions = {};
    var fixedEncodeURIComponent = function(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
            return "%" + c.charCodeAt(0).toString(16)
        })
    };
    self.setDefaultOptions = function(options) {
        self.defaultOptions = options
    }, self.$get = function() {
        return {
            get: function(name) {
                var jsonCookie = $.cookie(name);
                return jsonCookie ? angular.fromJson(decodeURIComponent(jsonCookie)) : null
            },
            put: function(name, value, options) {
                options = $.extend({}, self.defaultOptions, options), $.cookie.raw = !0, $.cookie(name, fixedEncodeURIComponent(angular.toJson(value)), options)
            },
            remove: function(name, options) {
                options = $.extend({}, self.defaultOptions, options), $.removeCookie(name, options)
            }
        }
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.Models = Bahmni.Common.Models || {}, angular.module("bahmni.common.models", []), angular.module("bahmni.common.models").factory("age", [function() {
    var dateUtil = Bahmni.Common.Util.DateUtil,
        fromBirthDate = function(birthDate) {
            var today = dateUtil.now(),
                period = dateUtil.diffInYearsMonthsDays(birthDate, today);
            return create(period.years, period.months, period.days)
        },
        create = function(years, months, days) {
            var isEmpty = function() {
                return !(this.years || this.months || this.days)
            };
            return {
                years: years,
                months: months,
                days: days,
                isEmpty: isEmpty
            }
        },
        calculateBirthDate = function(age) {
            var birthDate = dateUtil.now();
            return birthDate = dateUtil.subtractYears(birthDate, age.years), birthDate = dateUtil.subtractMonths(birthDate, age.months), birthDate = dateUtil.subtractDays(birthDate, age.days)
        };
    return {
        fromBirthDate: fromBirthDate,
        create: create,
        calculateBirthDate: calculateBirthDate
    }
}]), Bahmni.Common.AuditLogEventDetails = {
    USER_LOGIN_SUCCESS: {
        eventType: "USER_LOGIN_SUCCESS",
        message: "USER_LOGIN_SUCCESS_MESSAGE"
    },
    USER_LOGIN_FAILED: {
        eventType: "USER_LOGIN_FAILED",
        message: "USER_LOGIN_FAILED_MESSAGE"
    },
    USER_LOGOUT_SUCCESS: {
        eventType: "USER_LOGOUT_SUCCESS",
        message: "USER_LOGOUT_SUCCESS_MESSAGE"
    },
    OPEN_VISIT: {
        eventType: "OPEN_VISIT",
        message: "OPEN_VISIT_MESSAGE"
    },
    EDIT_VISIT: {
        eventType: "EDIT_VISIT",
        message: "EDIT_VISIT_MESSAGE"
    },
    CLOSE_VISIT: {
        eventType: "CLOSE_VISIT",
        message: "CLOSE_VISIT_MESSAGE"
    },
    CLOSE_VISIT_FAILED: {
        eventType: "CLOSE_VISIT_FAILED",
        message: "CLOSE_VISIT_FAILED_MESSAGE"
    },
    EDIT_ENCOUNTER: {
        eventType: "EDIT_ENCOUNTER",
        message: "EDIT_ENCOUNTER_MESSAGE"
    },
    VIEWED_REGISTRATION_PATIENT_SEARCH: {
        eventType: "VIEWED_REGISTRATION_PATIENT_SEARCH",
        message: "VIEWED_REGISTRATION_PATIENT_SEARCH_MESSAGE"
    },
    VIEWED_NEW_PATIENT_PAGE: {
        eventType: "VIEWED_NEW_PATIENT_PAGE",
        message: "VIEWED_NEW_PATIENT_PAGE_MESSAGE"
    },
    REGISTER_NEW_PATIENT: {
        eventType: "REGISTER_NEW_PATIENT",
        message: "REGISTER_NEW_PATIENT_MESSAGE"
    },
    EDIT_PATIENT_DETAILS: {
        eventType: "EDIT_PATIENT_DETAILS",
        message: "EDIT_PATIENT_DETAILS_MESSAGE"
    },
    ACCESSED_REGISTRATION_SECOND_PAGE: {
        eventType: "ACCESSED_REGISTRATION_SECOND_PAGE",
        message: "ACCESSED_REGISTRATION_SECOND_PAGE_MESSAGE"
    },
    VIEWED_PATIENT_DETAILS: {
        eventType: "VIEWED_PATIENT_DETAILS",
        message: "VIEWED_PATIENT_DETAILS_MESSAGE"
    },
    PRINT_PATIENT_STICKER: {
        eventType: "PRINT_PATIENT_STICKER",
        message: "PRINT_PATIENT_STICKER_MESSAGE"
    },
    VIEWED_CLINICAL_PATIENT_SEARCH: {
        eventType: "VIEWED_CLINICAL_PATIENT_SEARCH",
        message: "VIEWED_PATIENT_SEARCH_MESSAGE"
    },
    VIEWED_CLINICAL_DASHBOARD: {
        eventType: "VIEWED_CLINICAL_DASHBOARD",
        message: "VIEWED_CLINICAL_DASHBOARD_MESSAGE"
    },
    VIEWED_OBSERVATIONS_TAB: {
        eventType: "VIEWED_OBSERVATIONS_TAB",
        message: "VIEWED_OBSERVATIONS_TAB_MESSAGE"
    },
    VIEWED_DIAGNOSIS_TAB: {
        eventType: "VIEWED_DIAGNOSIS_TAB",
        message: "VIEWED_DIAGNOSIS_TAB_MESSAGE"
    },
    VIEWED_TREATMENT_TAB: {
        eventType: "VIEWED_TREATMENT_TAB",
        message: "VIEWED_TREATMENT_TAB_MESSAGE"
    },
    VIEWED_DISPOSITION_TAB: {
        eventType: "VIEWED_DISPOSITION_TAB",
        message: "VIEWED_DISPOSITION_TAB_MESSAGE"
    },
    VIEWED_DASHBOARD_SUMMARY: {
        eventType: "VIEWED_DASHBOARD_SUMMARY",
        message: "VIEWED_DASHBOARD_SUMMARY_MESSAGE"
    },
    VIEWED_ORDERS_TAB: {
        eventType: "VIEWED_ORDERS_TAB",
        message: "VIEWED_ORDERS_TAB_MESSAGE"
    },
    VIEWED_BACTERIOLOGY_TAB: {
        eventType: "VIEWED_BACTERIOLOGY_TAB",
        message: "VIEWED_BACTERIOLOGY_TAB_MESSAGE"
    },
    VIEWED_INVESTIGATION_TAB: {
        eventType: "VIEWED_INVESTIGATION_TAB",
        message: "VIEWED_INVESTIGATION_TAB_MESSAGE"
    },
    VIEWED_SUMMARY_PRINT: {
        eventType: "VIEWED_SUMMARY_PRINT",
        message: "VIEWED_SUMMARY_PRINT_MESSAGE"
    },
    VIEWED_VISIT_DASHBOARD: {
        eventType: "VIEWED_VISIT_DASHBOARD",
        message: "VIEWED_VISIT_DASHBOARD_MESSAGE"
    },
    VIEWED_VISIT_PRINT: {
        eventType: "VIEWED_VISIT_PRINT",
        message: "VIEWED_VISIT_PRINT_MESSAGE"
    },
    VIEWED_DASHBOARD_OBSERVATION: {
        eventType: "VIEWED_DASHBOARD_OBSERVATION",
        message: "VIEWED_DASHBOARD_OBSERVATION_MESSAGE"
    },
    VIEWED_PATIENTPROGRAM: {
        eventType: "VIEWED_PATIENTPROGRAM",
        message: "VIEWED_PATIENTPROGRAM_MESSAGE"
    },
    RUN_REPORT: {
        eventType: "RUN_REPORT",
        message: "RUN_REPORT_MESSAGE"
    }
}, angular.module("FredrikSandell.worker-pool", []).service("WorkerService", ["$q", function($q) {
    function createAngularWorkerTemplate() {
        var workerTemplate = ["", "//try {", "var window = self;", "self.history = {};", "var Node = function() {};", "var app", "var localStorage = {storage: <STORAGE>, getItem: function(key) {return this.storage[key]}, setItem: function(key, value) {this.storage[key]=value}}", "var document = {", "      readyState: 'complete',", "      cookie: '',", "      querySelector: function () {},", "      createElement: function () {", "          return {", "              pathname: '',", "              setAttribute: function () {}", "          };", "      }", "};", "importScripts('<URL_TO_ANGULAR>');", "<CUSTOM_DEP_INCLUDES>", "angular = window.angular;", "var workerApp = angular.module('WorkerApp', [<DEP_MODULES>]);", "workerApp.run(['$q'<STRING_DEP_NAMES>, function ($q<DEP_NAMES>) {", "  self.addEventListener('message', function(e) {", "    var input = e.data;", "    var output = $q.defer();", "    var promise = output.promise;", "    promise.then(function(success) {", "      self.postMessage({event:'success', data : success});", "    }, function(reason) {", "      self.postMessage({event:'failure', data : reason});", "    }, function(update) {", "      self.postMessage({event:'update', data : update});", "    });", "    <WORKER_FUNCTION>;", "  });", "  self.postMessage({event:'initDone'});", "}]);", "angular.bootstrap(null, ['WorkerApp']);", "//} catch(e) {self.postMessage(JSON.stringify(e));}"];
        return workerTemplate.join("\n")
    }

    function createIncludeStatements(listOfServiceNames) {
        var includeString = "";
        return angular.forEach(scriptsToLoad, function(script) {
            includeString += "importScripts('" + script + "');"
        }), angular.forEach(listOfServiceNames, function(serviceName) {
            serviceToUrlMap[serviceName] && (includeString += "importScripts('" + serviceToUrlMap[serviceName].url + "');")
        }), includeString
    }

    function createModuleList(listOfServiceNames) {
        var moduleNameList = [];
        return angular.forEach(listOfServiceNames, function(serviceName) {
            serviceToUrlMap[serviceName] && moduleNameList.push("'" + serviceToUrlMap[serviceName].moduleName + "'")
        }), moduleNameList.join(",")
    }

    function createDependencyMetaData(dependencyList) {
        var dependencyServiceNames = dependencyList.filter(function(dep) {
                return "input" !== dep && "output" !== dep && "$q" !== dep
            }),
            depMetaData = {
                dependencies: dependencyServiceNames,
                moduleList: createModuleList(dependencyServiceNames),
                angularDepsAsStrings: dependencyServiceNames.length > 0 ? "," + dependencyServiceNames.map(function(dep) {
                    return "'" + dep + "'"
                }).join(",") : "",
                angularDepsAsParamList: dependencyServiceNames.length > 0 ? "," + dependencyServiceNames.join(",") : "",
                servicesIncludeStatements: createIncludeStatements(dependencyServiceNames)
            };
        return depMetaData.workerFuncParamList = "input,output" + depMetaData.angularDepsAsParamList, depMetaData
    }

    function populateWorkerTemplate(workerFunc, dependencyMetaData) {
        return workerTemplate.replace("<URL_TO_ANGULAR>", urlToAngular).replace("<CUSTOM_DEP_INCLUDES>", dependencyMetaData.servicesIncludeStatements).replace("<DEP_MODULES>", dependencyMetaData.moduleList).replace("<STRING_DEP_NAMES>", dependencyMetaData.angularDepsAsStrings).replace("<DEP_NAMES>", dependencyMetaData.angularDepsAsParamList).replace("<STORAGE>", JSON.stringify(storage)).replace("<WORKER_FUNCTION>", workerFunc.toString())
    }
    var that = {},
        urlToAngular = "http://localhost:9876/base/bower_components/angular/angular.js",
        serviceToUrlMap = {},
        storage = {},
        scriptsToLoad = [];
    that.setAngularUrl = function(urlToAngularJs) {
        urlToAngular = urlToAngularJs
    };
    var workerTemplate = createAngularWorkerTemplate();
    that.addDependency = function(serviceName, moduleName, url) {
        return serviceToUrlMap[serviceName] = {
            url: url,
            moduleName: moduleName
        }, that
    }, that.includeScripts = function(url) {
        scriptsToLoad.push(url)
    }, that.addToLocalStorage = function(key, value) {
        storage[key] = value
    };
    var buildAngularWorker = function(initializedWorker) {
            var that = {};
            return that.worker = initializedWorker, that.run = function(input) {
                var deferred = $q.defer();
                return initializedWorker.addEventListener("message", function(e) {
                    var eventId = e.data.event;
                    if ("initDone" === eventId) throw "Received worker initialization in run method. This should already have occurred!";
                    "success" === eventId ? deferred.resolve(e.data.data) : "failure" === eventId ? deferred.reject(e.data.data) : "update" === eventId ? deferred.notify(e.data.data) : deferred.reject(e)
                }), initializedWorker.postMessage(input), deferred.promise
            }, that.terminate = function() {
                initializedWorker.terminate()
            }, that
        },
        extractDependencyList = function(depFuncList) {
            return depFuncList.slice(0, depFuncList.length - 1)
        },
        workerFunctionToString = function(func, paramList) {
            return "(" + func.toString() + ")(" + paramList + ")"
        };
    return that.createAngularWorker = function(depFuncList) {
        if (!Array.isArray(depFuncList) || depFuncList.length < 3 || "function" != typeof depFuncList[depFuncList.length - 1]) throw "Input needs to be: ['workerInput','deferredOutput'/*optional additional dependencies*/,\n    function(workerInput, deferredOutput /*optional additional dependencies*/)\n        {/*worker body*/}]";
        var deferred = $q.defer(),
            dependencyMetaData = createDependencyMetaData(extractDependencyList(depFuncList)),
            blobURL = (window.webkitURL ? webkitURL : URL).createObjectURL(new Blob([populateWorkerTemplate(workerFunctionToString(depFuncList[depFuncList.length - 1], dependencyMetaData.workerFuncParamList), dependencyMetaData)], {
                type: "application/javascript"
            })),
            worker = new Worker(blobURL);
        return worker.addEventListener("message", function(e) {
            var eventId = e.data.event;
            console.log(e.data), "initDone" === eventId ? deferred.resolve(buildAngularWorker(worker)) : deferred.reject(e)
        }), deferred.promise
    }, that
}]), angular.module("bahmni.common.routeErrorHandler", ["ui.router"]).run(["$rootScope", function($rootScope) {
    $rootScope.$on("$stateChangeError", function(event) {
        event.preventDefault()
    })
}]), Bahmni.Common.Util.DateUtil = {
    diffInDays: function(dateFrom, dateTo) {
        return Math.floor((this.parse(dateTo) - this.parse(dateFrom)) / 864e5)
    },
    diffInMinutes: function(dateFrom, dateTo) {
        return moment(dateTo).diff(moment(dateFrom), "minutes")
    },
    diffInSeconds: function(dateFrom, dateTo) {
        return moment(dateFrom).diff(moment(dateTo), "seconds")
    },
    isInvalid: function(date) {
        return "Invalid Date" == date
    },
    diffInDaysRegardlessOfTime: function(dateFrom, dateTo) {
        var from = new Date(dateFrom),
            to = new Date(dateTo);
        return from.setHours(0, 0, 0, 0), to.setHours(0, 0, 0, 0), Math.floor((to - from) / 864e5)
    },
    addSeconds: function(date, seconds) {
        return moment(date).add(seconds, "seconds").toDate()
    },
    addMinutes: function(date, minutes) {
        return this.addSeconds(date, 60 * minutes)
    },
    addDays: function(date, days) {
        return moment(date).add(days, "day").toDate()
    },
    addMonths: function(date, months) {
        return moment(date).add(months, "month").toDate()
    },
    addYears: function(date, years) {
        return moment(date).add(years, "year").toDate()
    },
    subtractSeconds: function(date, seconds) {
        return moment(date).subtract(seconds, "seconds").toDate()
    },
    subtractDays: function(date, days) {
        return this.addDays(date, -1 * days)
    },
    subtractMonths: function(date, months) {
        return this.addMonths(date, -1 * months)
    },
    subtractYears: function(date, years) {
        return this.addYears(date, -1 * years)
    },
    createDays: function(startDate, endDate) {
        for (var startDate = this.getDate(startDate), endDate = this.getDate(endDate), numberOfDays = this.diffInDays(startDate, endDate), days = [], i = 0; i <= numberOfDays; i++) days.push({
            dayNumber: i + 1,
            date: this.addDays(startDate, i)
        });
        return days
    },
    getDayNumber: function(referenceDate, date) {
        return this.diffInDays(this.getDate(referenceDate), this.getDate(date)) + 1
    },
    getDateWithoutTime: function(datetime) {
        return datetime ? moment(datetime).format("YYYY-MM-DD") : null
    },
    getDateInMonthsAndYears: function(date, format) {
        var format = format || "MMM YY",
            dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        return moment(dateRepresentation).isValid() ? dateRepresentation ? moment(dateRepresentation).format(format) : null : date
    },
    formatDateWithTime: function(datetime) {
        var dateRepresentation = isNaN(Number(datetime)) ? datetime : Number(datetime);
        return moment(dateRepresentation).isValid() ? dateRepresentation ? moment(dateRepresentation).format("DD MMM YY h:mm a") : null : datetime
    },
    formatDateWithoutTime: function(date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        return moment(dateRepresentation).isValid() ? dateRepresentation ? moment(dateRepresentation).format("DD MMM YY") : null : date
    },
    formatDateInStrictMode: function(date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        return moment(dateRepresentation, "YYYY-MM-DD", !0).isValid() ? moment(dateRepresentation).format("DD MMM YY") : moment(dateRepresentation, "YYYY-MM-DDTHH:mm:ss.SSSZZ", !0).isValid() ? moment(dateRepresentation).format("DD MMM YY") : date
    },
    formatTime: function(date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        return moment(dateRepresentation).isValid() ? dateRepresentation ? moment(dateRepresentation).format("h:mm a") : null : date
    },
    getDate: function(dateTime) {
        return moment(this.parse(dateTime)).startOf("day").toDate()
    },
    parse: function(dateString) {
        return dateString ? moment(dateString).toDate() : null
    },
    parseDatetime: function(dateTimeString) {
        return dateTimeString ? moment(dateTimeString) : null
    },
    now: function() {
        return new Date
    },
    today: function() {
        return this.getDate(this.now())
    },
    endOfToday: function() {
        return moment(this.parse(this.now())).endOf("day").toDate()
    },
    getDateWithoutHours: function(dateString) {
        return moment(dateString).toDate().setHours(0, 0, 0, 0)
    },
    getDateTimeWithoutSeconds: function(dateString) {
        return moment(dateString).toDate().setSeconds(0, 0)
    },
    isSameDateTime: function(date1, date2) {
        if (null == date1 || null == date2) return !1;
        var dateOne = this.parse(date1),
            dateTwo = this.parse(date2);
        return dateOne.getTime() == dateTwo.getTime()
    },
    isBeforeDate: function(date1, date2) {
        return moment(date1).isBefore(moment(date2))
    },
    isSameDate: function(date1, date2) {
        if (null == date1 || null == date2) return !1;
        var dateOne = this.parse(date1),
            dateTwo = this.parse(date2);
        return dateOne.getFullYear() === dateTwo.getFullYear() && dateOne.getMonth() === dateTwo.getMonth() && dateOne.getDate() === dateTwo.getDate()
    },
    diffInYearsMonthsDays: function(dateFrom, dateTo) {
        dateFrom = this.parse(dateFrom), dateTo = this.parse(dateTo);
        var from = {
                d: dateFrom.getDate(),
                m: dateFrom.getMonth(),
                y: dateFrom.getFullYear()
            },
            to = {
                d: dateTo.getDate(),
                m: dateTo.getMonth(),
                y: dateTo.getFullYear()
            },
            age = {
                d: 0,
                m: 0,
                y: 0
            },
            daysFebruary = to.y % 4 != 0 || to.y % 100 == 0 && to.y % 400 != 0 ? 28 : 29,
            daysInMonths = [31, daysFebruary, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return age.y = to.y - from.y, age.m = to.m - from.m, from.m > to.m && (age.y = age.y - 1, age.m = to.m - from.m + 12), age.d = to.d - from.d, from.d > to.d && (age.m = age.m - 1, from.m == to.m && (age.y = age.y - 1, age.m = age.m + 12), age.d = to.d - from.d + daysInMonths[parseInt(from.m)]), {
            days: age.d,
            months: age.m,
            years: age.y
        }
    },
    convertToUnits: function(minutes) {
        var allUnits = {
                Years: 525600,
                Months: 43200,
                Weeks: 10080,
                Days: 1440,
                Hours: 60,
                Minutes: 1
            },
            durationRepresentation = function(value, unitName, unitValueInMinutes) {
                return {
                    value: value,
                    unitName: unitName,
                    unitValueInMinutes: unitValueInMinutes,
                    allUnits: allUnits
                }
            };
        for (var unitName in allUnits) {
            var unitValueInMinutes = allUnits[unitName];
            if ((minutes || 0 !== minutes) && minutes >= unitValueInMinutes && minutes % unitValueInMinutes === 0) return durationRepresentation(minutes / unitValueInMinutes, unitName, unitValueInMinutes)
        }
        return durationRepresentation(void 0, void 0, void 0)
    },
    getEndDateFromDuration: function(dateFrom, value, unit) {
        dateFrom = this.parse(dateFrom);
        var from = {
                h: dateFrom.getHours(),
                d: dateFrom.getDate(),
                m: dateFrom.getMonth(),
                y: dateFrom.getFullYear()
            },
            to = new Date(from.y, from.m, from.d, from.h);
        return "Months" === unit ? to.setMonth(from.m + value) : "Weeks" === unit ? to.setDate(from.d + 7 * value) : "Days" === unit ? to.setDate(from.d + value) : "Hours" === unit && to.setHours(from.h + value), to
    },
    parseLongDateToServerFormat: function(longDate) {
        return longDate ? moment(longDate).format("YYYY-MM-DDTHH:mm:ss.SSS") : null
    },
    parseServerDateToDate: function(longDate) {
        return longDate ? moment(longDate, "YYYY-MM-DDTHH:mm:ss.SSSZZ").toDate() : null
    },
    getDateTimeInSpecifiedFormat: function(date, format) {
        return date ? moment(date).format(format) : null
    },
    getISOString: function(date) {
        return date ? moment(date).toDate().toISOString() : null
    },
//    npToday: function() {
//        var currentDate = this.now(),
//            currentNepaliDate = calendarFunctions.getBsDateByAdDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
//        return calendarFunctions.bsDateFormat("%y-%m-%d", currentNepaliDate.bsYear, currentNepaliDate.bsMonth, currentNepaliDate.bsDate)
//    },

    npToday: function() {
        var currentDate = this.now();
        if (currentDate instanceof Date && !isNaN(currentDate)) {
            var adDateObj = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1, 
                day: currentDate.getDate()
            };
            var bsDateObj = NepaliFunctions.AD2BS(adDateObj); 
            if (NepaliFunctions.BS.ValidateDate(bsDateObj)) {
                var formatted = NepaliFunctions.ConvertToDateFormat(bsDateObj, "YYYY-MM-DD"); 
                return formatted;
            }
        }
        return "";
    },
    isValid: function(date) {
        var dateRepresentation = isNaN(Number(date)) ? date : Number(date);
        return moment(dateRepresentation).isValid()
    },
    isBeforeTime: function(time, otherTime) {
        return moment(time, "hh:mm a").format("YYYY-MM-DD")
    }
}, Bahmni.Common.Util.ValidationUtil = function() {
    var isAcceptableType = function(propertyToCheck) {
            return _.includes(["string", "boolean", "number", "object"], typeof propertyToCheck)
        },
        flattenObject = function(ob) {
            var toReturn = {};
            for (var i in ob)
                if (ob.hasOwnProperty(i) && isAcceptableType(ob[i]))
                    if ("object" != typeof ob[i] || ob[i] instanceof Date) toReturn[i] = ob[i];
                    else {
                        var flatObject = flattenObject(ob[i]);
                        for (var x in flatObject) flatObject.hasOwnProperty(x) && isAcceptableType(flatObject[x]) && (toReturn[i + "." + x] = flatObject[x])
                    } return toReturn
        },
        validate = function(complexObject, objectConfiguration) {
            var allCustomValidators = Bahmni.Registration.customValidator;
            if (!allCustomValidators) return [];
            var dataArray = flattenObject(complexObject),
                errorMessages = [];
            return _.every(dataArray, function(value, field) {
                var isValid = !0,
                    fieldSpecificValidator = allCustomValidators[field];
                if (!fieldSpecificValidator) return isValid;
                if ("function" == typeof fieldSpecificValidator.method && value) {
                    var personAttributeTypeConfig = _.find(objectConfiguration, {
                        name: field
                    });
                    isValid = fieldSpecificValidator.method(field, value, personAttributeTypeConfig), isValid || (errorMessages.push(fieldSpecificValidator.errorMessage), isValid = !0)
                }
                return isValid
            }), errorMessages
        };
    return {
        validate: validate
    }
}(), Bahmni.Common.Util.DynamicResourceLoader = function() {
    return {
        includeJs: function(script) {
            var element = document.createElement("script");
            element.setAttribute("src", script), document.body.appendChild(element)
        },
        includeCss: function(url) {
            var element = document.createElement("link");
            element.setAttribute("href", url), element.setAttribute("rel", "stylesheet"), element.setAttribute("type", "text/css"), document.head.appendChild(element)
        }
    }
}(), Bahmni.Common.Util.ArrayUtil = {
    chunk: function(array, chunkSize) {
        for (var chunks = [], i = 0; i < array.length; i += chunkSize) chunks.push(array.slice(i, i + chunkSize));
        return chunks
    },
    groupByPreservingOrder: function(records, groupingFunction, keyName, valueName) {
        var groups = [];
        return records.forEach(function(record) {
            var recordKey = groupingFunction(record),
                existingGroup = _.find(groups, function(group) {
                    return group[keyName] === recordKey
                });
            if (existingGroup) existingGroup[valueName].push(record);
            else {
                var newGroup = {};
                newGroup[keyName] = recordKey, newGroup[valueName] = [record], groups.push(newGroup)
            }
        }), groups
    }
}, angular.module("httpErrorInterceptor", []).config(["$httpProvider", function($httpProvider) {
    var interceptor = ["$rootScope", "$q", function($rootScope, $q) {
        function stringAfter(value, searchString) {
            var indexOfFirstColon = value.indexOf(searchString);
            return value.substr(indexOfFirstColon + 1).trim()
        }

        function getServerError(message) {
            return stringAfter(message, ":")
        }

        function success(response) {
            return response
        }

        function shouldRedirectToLogin(response) {
            var errorMessage = response.data.error ? response.data.error.message : response.data;
            if (errorMessage.search("HTTP Status 403 - Session timed out") > 0) return !0
        }

        function error(response) {
            var data = response.data,
                unexpectedError = "There was an unexpected issue on the server. Please try again";
            if (500 === response.status) {
                var errorMessage = data.error && data.error.message ? getServerError(data.error.message) : unexpectedError;
                showError(errorMessage)
            } else if (409 === response.status) {
                var errorMessage = data.error && data.error.message ? getServerError(data.error.message) : "Duplicate entry error";
                showError(errorMessage)
            } else if (0 === response.status) showError("Could not connect to the server. Please check your connection and try again");
            else if (405 === response.status) showError(unexpectedError);
            else if (400 === response.status) {
                var errorMessage = data.error && data.error.message ? data.error.message : data.localizedMessage || "Could not connect to the server. Please check your connection and try again";
                showError(errorMessage)
            } else if (403 === response.status) {
                var errorMessage = data.error && data.error.message ? data.error.message : unexpectedError;
                shouldRedirectToLogin(response) ? $rootScope.$broadcast("event:auth-loginRequired") : showError(errorMessage)
            } else 404 === response.status && (_.includes(response.config.url, "implementation_config") || _.includes(response.config.url, "locale_") || _.includes(response.config.url, "offlineMetadata") || showError("The requested information does not exist"));
            return $q.reject(response)
        }
        var serverErrorMessages = Bahmni.Common.Constants.serverErrorMessages,
            showError = function(errorMessage) {
                var result = _.find(serverErrorMessages, function(listItem) {
                    return listItem.serverMessage === errorMessage
                });
                _.isEmpty(result) && $rootScope.$broadcast("event:serverError", errorMessage)
            };
        return {
            response: success,
            responseError: error
        }
    }];
    $httpProvider.interceptors.push(interceptor)
}]), Bahmni.Common.VisitControl = function(visitTypes, defaultVisitTypeName, encounterService, $translate, visitService) {
    var self = this;
    self.visitTypes = visitTypes, self.defaultVisitTypeName = defaultVisitTypeName, self.defaultVisitType = visitTypes.filter(function(visitType) {
        return visitType.name === defaultVisitTypeName
    })[0], self.startButtonText = function(visitType) {
        return $translate.instant("REGISTRATION_START_VISIT", {
            visitType: visitType.name
        })
    }, self.startVisit = function(visitType) {
        self.selectedVisitType = visitType, self.onStartVisit()
    }, self.createVisitOnly = function(patientUuid, visitLocationUuid) {
        var visitType = self.selectedVisitType || self.defaultVisitType,
            visitDetails = {
                patient: patientUuid,
                visitType: visitType.uuid,
                location: visitLocationUuid
            };
        return visitService.createVisit(visitDetails)
    }
}, angular.module("bahmni.common.config", []), angular.module("bahmni.common.config").service("configurations", ["configurationService", function(configurationService) {
    this.configs = {}, this.load = function(configNames) {
        var self = this;
        return configurationService.getConfigurations(_.difference(configNames, Object.keys(this.configs))).then(function(configurations) {
            angular.extend(self.configs, configurations)
        })
    }, this.dosageInstructionConfig = function() {
        return this.configs.dosageInstructionConfig || []
    }, this.stoppedOrderReasonConfig = function() {
        return this.configs.stoppedOrderReasonConfig || []
    }, this.dosageFrequencyConfig = function() {
        return this.configs.dosageFrequencyConfig || []
    }, this.allTestsAndPanelsConcept = function() {
        return this.configs.allTestsAndPanelsConcept.results[0] || []
    }, this.impressionConcept = function() {
        return this.configs.radiologyImpressionConfig.results[0] || []
    }, this.labOrderNotesConcept = function() {
        return this.configs.labOrderNotesConfig.results[0] || []
    }, this.consultationNoteConcept = function() {
        return this.configs.consultationNoteConfig.results[0] || []
    }, this.patientConfig = function() {
        return this.configs.patientConfig || {}
    }, this.encounterConfig = function() {
        return angular.extend(new EncounterConfig, this.configs.encounterConfig || [])
    }, this.patientAttributesConfig = function() {
        return this.configs.patientAttributesConfig.results
    }, this.identifierTypesConfig = function() {
        return this.configs.identifierTypesConfig
    }, this.genderMap = function() {
        return this.configs.genderMap
    }, this.addressLevels = function() {
        return this.configs.addressLevels
    }, this.relationshipTypes = function() {
        return this.configs.relationshipTypeConfig.results || []
    }, this.relationshipTypeMap = function() {
        return this.configs.relationshipTypeMap || {}
    }, this.loginLocationToVisitTypeMapping = function() {
        return this.configs.loginLocationToVisitTypeMapping || {}
    }, this.defaultEncounterType = function() {
        return this.configs.defaultEncounterType
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.Domain = Bahmni.Common.Domain || {}, Bahmni.Common.Domain.Helper = Bahmni.Common.Domain.Helper || {}, angular.module("bahmni.common.domain", []),
    function() {
        Bahmni.Common.Domain.ObservationFilter = function() {
            var self = this,
                voidExistingObservationWithOutValue = function(observations) {
                    observations.forEach(function(observation) {
                        voidExistingObservationWithOutValue(observation.groupMembers), observation.voided = observation.voided || observation.canBeVoided(), observation.voided && voidAllChildren(observation)
                    })
                },
                voidAllChildren = function(voidedObservation) {
                    voidedObservation.groupMembers.forEach(function(childWithVoidedParent) {
                        childWithVoidedParent.voided = !0, voidAllChildren(childWithVoidedParent)
                    })
                },
                removeNewObservationsWithoutValue = function(observations) {
                    return observations.forEach(function(observation) {
                        observation.groupMembers = removeNewObservationsWithoutValue(observation.groupMembers)
                    }), observations.filter(function(observation) {
                        var validObs = observation.isExisting() || observation.hasValue() || observation.hasMemberWithValue();
                        return validObs && !observation.voided || observation.isExisting() && observation.voided
                    })
                },
                removeNewObservationsWhichAreVoided = function(observations) {
                    return observations.forEach(function(observation) {
                        observation.groupMembers = removeNewObservationsWhichAreVoided(observation.groupMembers)
                    }), _.reject(observations, function(observation) {
                        return observation.isNew() && observation.voided
                    })
                };
            self.filter = function(observations) {
                var wrappedObservations = observations.map(Observation.wrap),
                    filteredObservations = removeNewObservationsWithoutValue(wrappedObservations);
                return filteredObservations = removeNewObservationsWhichAreVoided(filteredObservations), voidExistingObservationWithOutValue(filteredObservations), filteredObservations
            }
        };
        var Observation = function(observationData) {
            angular.extend(this, observationData), this.isNew = function() {
                return !this.uuid
            }, this.isExisting = function() {
                return !this.isNew()
            }, this.hasValue = function() {
                return void 0 !== this.value && null !== this.value && "" !== this.value
            }, this.hasMemberWithValue = function() {
                return this.groupMembers.some(function(groupMember) {
                    return groupMember.hasValue() || groupMember.hasMemberWithValue()
                })
            }, this.isGroup = function() {
                return this.groupMembers.length > 0
            }, this.isLeaf = function() {
                return !this.isGroup()
            }, this.isGroupWithOnlyVoidedMembers = function() {
                return this.isGroup() && this.groupMembers.every(function(groupMember) {
                    return groupMember.voided
                })
            }, this.isLeafNodeWithOutValue = function() {
                return this.isLeaf() && !this.hasValue()
            }, this.canBeVoided = function() {
                return this.isExisting() && (this.isLeafNodeWithOutValue() || this.isGroupWithOnlyVoidedMembers())
            }
        };
        Observation.wrap = function(observationData) {
            var observation = new Observation(observationData);
            return observation.groupMembers = observation.groupMembers ? observation.groupMembers.map(Observation.wrap) : [], observation
        }
    }(), Bahmni.Common.Domain.Helper.getHintForNumericConcept = function(concept) {
        if (concept) return null != concept.hiNormal && null != concept.lowNormal ? "(" + concept.lowNormal + " - " + concept.hiNormal + ")" : null != concept.hiNormal && null == concept.lowNormal ? "(< " + concept.hiNormal + ")" : null == concept.hiNormal && null != concept.lowNormal ? "(> " + concept.lowNormal + ")" : ""
    }, Bahmni.Common.Domain.ConceptMapper = function() {
        this.map = function(openMrsConcept) {
            if (!openMrsConcept) return null;
            if (alreadyMappedConcept(openMrsConcept)) return openMrsConcept;
            var openMrsDescription = openMrsConcept.descriptions ? openMrsConcept.descriptions[0] : null,
                shortConceptName = _.find(openMrsConcept.names, {
                    conceptNameType: "SHORT"
                });
            return {
                uuid: openMrsConcept.uuid,
                name: openMrsConcept.name.name,
                shortName: shortConceptName ? shortConceptName.name : null,
                description: openMrsDescription ? openMrsDescription.description : null,
                set: openMrsConcept.set,
                dataType: openMrsConcept.datatype ? openMrsConcept.datatype.name : null,
                hiAbsolute: openMrsConcept.hiAbsolute,
                lowAbsolute: openMrsConcept.lowAbsolute,
                hiNormal: openMrsConcept.hiNormal,
                handler: openMrsConcept.handler,
                allowDecimal: openMrsConcept.allowDecimal,
                lowNormal: openMrsConcept.lowNormal,
                conceptClass: openMrsConcept.conceptClass ? openMrsConcept.conceptClass.name : null,
                answers: openMrsConcept.answers,
                units: openMrsConcept.units,
                displayString: shortConceptName ? shortConceptName.name : openMrsConcept.name.name,
                names: openMrsConcept.names
            }
        };
        var alreadyMappedConcept = function(concept) {
            return !concept.name.name
        }
    }, angular.module("bahmni.common.domain").factory("providerService", ["$http", function($http) {
        var search = function(fieldValue) {
                return $http.get(Bahmni.Common.Constants.providerUrl, {
                    method: "GET",
                    params: {
                        q: fieldValue,
                        v: "full"
                    },
                    withCredentials: !0
                })
            },
            searchByUuid = function(uuid) {
                return $http.get(Bahmni.Common.Constants.providerUrl, {
                    method: "GET",
                    params: {
                        user: uuid
                    },
                    cache: !1
                })
            },
            list = function(params) {
                return $http.get(Bahmni.Common.Constants.providerUrl, {
                    method: "GET",
                    cache: !1,
                    params: params
                })
            };
        return {
            search: search,
            searchByUuid: searchByUuid,
            list: list
        }
    }]);
var EncounterConfig = function() {
    function EncounterConfig(encounterTypes) {
        this.encounterTypes = encounterTypes
    }
    return EncounterConfig.prototype = {
        getConsultationEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid("Consultation")
        },
        getAdmissionEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid("ADMISSION")
        },
        getDischargeEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid("DISCHARGE")
        },
        getTransferEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid("TRANSFER")
        },
        getRadiologyEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid("RADIOLOGY")
        },
        getPatientDocumentEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid("Patient Document")
        },
        getValidationEncounterTypeUuid: function() {
            return this.getEncounterTypeUuid(Bahmni.Common.Constants.validationNotesEncounterType)
        },
        getEncounterTypeUuid: function(encounterTypeName) {
            return this.encounterTypes[encounterTypeName]
        },
        getVisitTypes: function() {
            var visitTypesArray = [];
            for (var name in this.visitTypes) visitTypesArray.push({
                name: name,
                uuid: this.visitTypes[name]
            });
            return visitTypesArray
        },
        getEncounterTypes: function() {
            var encounterTypesArray = [];
            for (var name in this.encounterTypes) encounterTypesArray.push({
                name: name,
                uuid: this.encounterTypes[name]
            });
            return encounterTypesArray
        },
        getVisitTypeByUuid: function(uuid) {
            var visitTypes = this.getVisitTypes();
            return visitTypes.filter(function(visitType) {
                return visitType.uuid === uuid
            })[0]
        },
        getEncounterTypeByUuid: function(uuid) {
            var encounterType = this.getEncounterTypes();
            return encounterType.filter(function(encounterType) {
                return encounterType.uuid === uuid
            })[0]
        }
    }, EncounterConfig
}();
! function() {
    var nameFor = {
        Date: function(obs) {
            return moment(obs.value).format("D-MMM-YYYY")
        },
        Datetime: function(obs) {
            var date = Bahmni.Common.Util.DateUtil.parseDatetime(obs.value);
            return null != date ? Bahmni.Common.Util.DateUtil.formatDateWithTime(date) : ""
        },
        Boolean: function(obs) {
            return obs.value === !0 ? "Yes" : obs.value === !1 ? "No" : obs.value
        },
        Coded: function(obs) {
            return obs.value.shortName || obs.value.name || obs.value
        },
        Object: function(obs) {
            return nameFor.Coded(obs)
        },
        MultiSelect: function(obs) {
            return obs.getValues().join(", ")
        },
        Default: function(obs) {
            return obs.value
        }
    };
    Bahmni.Common.Domain.ObservationValueMapper = {
        getNameFor: nameFor,
        map: function(obs) {
            var type = obs.concept && obs.concept.dataType || obs.type;
            return type in nameFor || (type = "object" == typeof obs.value && "Object" || obs.isMultiSelect && "MultiSelect" || "Default"), nameFor[type](obs)
        }
    }
}(), angular.module("bahmni.common.uiHelper", ["ngClipboard"]), angular.module("bahmni.common.uiHelper").directive("nonBlank", function() {
        return function($scope, element, attrs) {
            var addNonBlankAttrs = function() {
                    element.attr({
                        required: "required"
                    })
                },
                removeNonBlankAttrs = function() {
                    element.removeAttr("required")
                };
            return attrs.nonBlank ? void $scope.$watch(attrs.nonBlank, function(value) {
                return value ? addNonBlankAttrs() : removeNonBlankAttrs()
            }) : addNonBlankAttrs(element)
        }
    }).directive("datepicker", function() {
        var link = function($scope, element, attrs, ngModel) {
            var maxDate = attrs.maxDate,
                minDate = attrs.minDate || "-120y",
                format = attrs.dateFormat || "dd-mm-yy";
            element.datepicker({
                changeYear: !0,
                changeMonth: !0,
                maxDate: maxDate,
                minDate: minDate,
                yearRange: "c-120:c+120",
                dateFormat: format,
                onSelect: function(dateText) {
                    $scope.$apply(function() {
                        ngModel.$setViewValue(dateText)
                    })
                }
            })
        };
        return {
            require: "ngModel",
            link: link
        }
    }).directive("myAutocomplete", ["$parse", function($parse) {
        var link = function(scope, element, attrs, ngModelCtrl) {
            var source = ($parse(attrs.ngModel), scope.source()),
                responseMap = scope.responseMap(),
                onSelect = scope.onSelect();
            element.autocomplete({
                autofocus: !0,
                minLength: 2,
                source: function(request, response) {
                    source(attrs.id, request.term, attrs.itemType).then(function(data) {
                        var results = responseMap ? responseMap(data.data) : data.data;
                        response(results)
                    })
                },
                select: function(event, ui) {
                    return scope.$apply(function(scope) {
                        ngModelCtrl.$setViewValue(ui.item.value), scope.$eval(attrs.ngChange), null != onSelect && onSelect(ui.item)
                    }), !0
                },
                search: function(event) {
                    var searchTerm = $.trim(element.val());
                    searchTerm.length < 2 && event.preventDefault()
                }
            })
        };
        return {
            link: link,
            require: "ngModel",
            scope: {
                source: "&",
                responseMap: "&",
                onSelect: "&"
            }
        }
    }]).directive("bmForm", ["$timeout", function($timeout) {
        var link = function(scope, elem, attrs) {
            $timeout(function() {
                $(elem).unbind("submit").submit(function(e) {
                    var formScope = scope.$parent,
                        formName = attrs.name;
                    e.preventDefault(), scope.autofillable && $(elem).find("input").trigger("change"), formScope[formName].$valid ? (formScope.$apply(attrs.ngSubmit), $(elem).removeClass("submitted-with-error")) : $(elem).addClass("submitted-with-error")
                })
            }, 0)
        };
        return {
            link: link,
            require: "form",
            scope: {
                autofillable: "="
            }
        }
    }]).directive("patternValidate", ["$timeout", function($timeout) {
        return function($scope, element, attrs) {
            var addPatternToElement = function() {
                $scope.fieldValidation && $scope.fieldValidation[attrs.id] && element.attr({
                    pattern: $scope.fieldValidation[attrs.id].pattern,
                    title: $scope.fieldValidation[attrs.id].errorMessage,
                    type: "text"
                })
            };
            $timeout(addPatternToElement)
        }
    }]).directive("validateOn", function() {
        var link = function(scope, element, attrs, ngModelCtrl) {
            var validationMessage = attrs.validationMessage || "Please enter a valid detail",
                setValidity = function(value) {
                    var valid = !!value;
                    ngModelCtrl.$setValidity("blank", valid), element[0].setCustomValidity(valid ? "" : validationMessage)
                };
            scope.$watch(attrs.validateOn, setValidity, !0)
        };
        return {
            link: link,
            require: "ngModel"
        }
    }), angular.module("bahmni.common.uiHelper").directive("toggle", function() {
        var link = function($scope, element) {
            $scope.toggle = void 0 !== $scope.toggle && $scope.toggle, $(element).click(function() {
                $scope.$apply(function() {
                    $scope.toggle = !$scope.toggle
                })
            }), $scope.$watch("toggle", function() {
                $(element).toggleClass("active", $scope.toggle)
            }), $scope.$on("$destroy", function() {
                element.off("click")
            })
        };
        return {
            scope: {
                toggle: "="
            },
            link: link
        }
    }), angular.module("bahmni.common.uiHelper").directive("bmPopOver", function() {
        var controller = function($scope) {
            $scope.targetElements = [];
            var hideTargetElements = function() {
                    $scope.targetElements.forEach(function(el) {
                        el.hide()
                    })
                },
                showTargetElements = function() {
                    $scope.targetElements.forEach(function(el) {
                        el.show()
                    })
                };
            this.registerTriggerElement = function(triggerElement) {
                $scope.triggerElement = triggerElement;
                var docClickHandler = function() {
                    $scope.autoclose && (hideTargetElements(), $scope.isTargetOpen = !1, $(document).off("click", docClickHandler))
                };
                $scope.triggerElement.on("click", function(event) {
                    $scope.isTargetOpen ? ($scope.isTargetOpen = !1, hideTargetElements(0), $(document).off("click", docClickHandler)) : ($scope.isTargetOpen = !0, showTargetElements(), $(document).on("click", docClickHandler), event.stopImmediatePropagation())
                }), $scope.$on("$destroy", function() {
                    $(document).off("click", docClickHandler)
                })
            }, this.registerTargetElement = function(targetElement) {
                targetElement.hide(), $scope.targetElements.push(targetElement)
            };
            var hideOrShowTargetElements = function() {
                $scope.isTargetOpen && ($scope.isTargetOpen = !1, hideTargetElements(0))
            };
            $(document).on("click", ".reg-wrapper", hideOrShowTargetElements), $scope.$on("$destroy", function() {
                $(document).off("click", ".reg-wrapper", hideOrShowTargetElements)
            })
        };
        return {
            restrict: "A",
            controller: controller,
            scope: {
                autoclose: "="
            }
        }
    }).directive("bmPopOverTarget", function() {
        var link = function($scope, element, attrs, popOverController) {
            popOverController.registerTargetElement(element)
        };
        return {
            restrict: "A",
            require: "^bmPopOver",
            link: link
        }
    }).directive("bmPopOverTrigger", function() {
        var link = function($scope, element, attrs, popOverController) {
            popOverController.registerTriggerElement(element)
        };
        return {
            restrict: "A",
            require: "^bmPopOver",
            link: link
        }
    }), angular.module("bahmni.common.uiHelper").directive("splitButton", ["$timeout", function($timeout) {
        var controller = function($scope) {
                $scope.primaryOption = $scope.primaryOption || $scope.options[0], $scope.secondaryOptions = _.without($scope.options, $scope.primaryOption), $scope.hasMultipleOptions = function() {
                    return $scope.secondaryOptions.length > 0
                }
            },
            link = function(scope, element) {
                var shouldScroll = function(elementPosition, elementHeight) {
                    var windowHeight = window.innerHeight + $(window).scrollTop();
                    return windowHeight < elementHeight + elementPosition
                };
                scope.scrollToBottom = function() {
                    var timeout = $timeout(function() {
                        var scrollHeight = $(element)[0].scrollHeight;
                        shouldScroll(element.position().top, scrollHeight) && (window.scrollBy(0, scrollHeight), $timeout.cancel(timeout))
                    })
                }
            };
        return {
            restrict: "A",
            template: '<div class="split-button" bm-pop-over><button bm-pop-over-trigger class="toggle-button fa fa-caret-down" ng-show="::hasMultipleOptions()" ng-click="scrollToBottom()" ng-disabled="optionDisabled" type="button"></button><ul class="options"><li class="primaryOption"><button class="buttonClass" ng-click="optionClick()(primaryOption)" accesskey="{{::primaryOption.shortcutKey}}" ng-disabled="optionDisabled" ng-bind-html="::optionText()(primaryOption,\'primary\') | translate "></button></li><ul class="hidden-options"><li bm-pop-over-target ng-repeat="option in ::secondaryOptions" class="secondaryOption"><button class="buttonClass" ng-click="optionClick()(option)" accesskey="{{::option.shortcutKey}}" ng-disabled="optionDisabled" ng-bind-html="::optionText()(option) | translate"></button></li></ul></ul></div>',
            controller: controller,
            link: link,
            scope: {
                options: "=",
                primaryOption: "=",
                optionText: "&",
                optionClick: "&",
                optionDisabled: "="
            }
        }
    }]), angular.module("bahmni.common.uiHelper").directive("focusOn", ["$timeout", function($timeout) {
        return function(scope, elem, attrs) {
            Modernizr.ios || scope.$watch(attrs.focusOn, function(value) {
                value && $timeout(function() {
                    $(elem).focus()
                })
            })
        }
    }]),
    function() {
        var constructSearchResult = function(concept, searchString) {
                var matchingName = null,
                    conceptName = concept.name;
                if (!_.includes(_.toLower(conceptName), _.toLower(searchString))) {
                    var synonyms = _.map(concept.names, "name");
                    matchingName = _.find(synonyms, function(name) {
                        return name !== conceptName && name.search(new RegExp(searchString, "i")) !== -1
                    })
                }
                return {
                    label: matchingName ? matchingName + " => " + conceptName : conceptName,
                    value: conceptName,
                    concept: concept,
                    uuid: concept.uuid,
                    name: conceptName
                }
            },
            searchWithDefaultConcept = function(searchMethod, request, response) {
                var searchTerm = _.toLower(request.term.trim()),
                    isMatching = function(answer) {
                        var conceptNameFound = _.find(answer.names, function(name) {
                                return _.includes(_.toLower(name.name), searchTerm)
                            }),
                            conceptDrugNameFound = _.includes(_.toLower(answer.name), searchTerm);
                        return conceptNameFound || conceptDrugNameFound
                    },
                    responseMap = _.partial(constructSearchResult, _, searchTerm);
                searchMethod().then(_.partial(_.filter, _, isMatching)).then(_.partial(_.map, _, responseMap)).then(response)
            },
            searchWithGivenConcept = function(searchMethod, request, response) {
                var searchTerm = request.term.trim(),
                    responseMap = _.partial(constructSearchResult, _, searchTerm);
                searchMethod().then(_.partial(_.map, _, responseMap)).then(response)
            },
            toBeInjected = ["$parse", "$http", "conceptService"],
            conceptAutocomplete = function($parse, $http, conceptService) {
                var link = function(scope, element, attrs, ngModelCtrl) {
                    var minLength = scope.minLength || 2,
                        previousValue = scope.previousValue,
                        validator = function(searchTerm) {
                            if (scope.strictSelect) return scope.illegalValue || !_.isEmpty(searchTerm) && searchTerm !== previousValue ? void element.addClass("illegalValue") : void element.removeClass("illegalValue")
                        };
                    element.autocomplete({
                        autofocus: !0,
                        minLength: minLength,
                        source: function(request, response) {
                            var searchMethod;
                            !scope.answersConceptName && scope.defaultConcept ? (searchMethod = _.partial(conceptService.getAnswers, scope.defaultConcept), searchWithDefaultConcept(searchMethod, request, response)) : (searchMethod = _.partial(conceptService.getAnswersForConceptName, {
                                term: request.term,
                                answersConceptName: scope.answersConceptName
                            }), searchWithGivenConcept(searchMethod, request, response))
                        },
                        select: function(event, ui) {
                            return scope.$apply(function(scope) {
                                ngModelCtrl.$setViewValue(ui.item), scope.blurOnSelect && element.blur(), previousValue = ui.item.value, validator(previousValue), scope.$eval(attrs.ngChange)
                            }), !0
                        },
                        search: function(event) {
                            var searchTerm = $.trim(element.val());
                            searchTerm.length < minLength && event.preventDefault(), previousValue = null
                        }
                    });
                    var blurHandler = function() {
                        var searchTerm = $.trim(element.val());
                        validator(searchTerm)
                    };
                    element.on("blur", blurHandler), scope.$on("$destroy", function() {
                        element.off("blur", blurHandler)
                    })
                };
                return {
                    link: link,
                    require: "ngModel",
                    scope: {
                        illegalValue: "=",
                        defaultConcept: "=",
                        answersConceptName: "=",
                        minLength: "=",
                        blurOnSelect: "=",
                        strictSelect: "=?",
                        previousValue: "="
                    }
                }
            };
        conceptAutocomplete.$inject = toBeInjected, angular.module("bahmni.common.uiHelper").directive("conceptAutocomplete", conceptAutocomplete)
    }(), angular.module("bahmni.common.uiHelper").directive("focusMe", ["$timeout", "$parse", function($timeout, $parse) {
        return {
            link: function(scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function(value) {
                    value === !0 && $timeout(function() {
                        element[0].focus()
                    })
                })
            }
        }
    }]), angular.module("bahmni.common.uiHelper").directive("bahmniAutocomplete", ["$translate", function($translate) {
        var link = function(scope, element, attrs, ngModelCtrl) {
            var source = scope.source(),
                responseMap = scope.responseMap && scope.responseMap(),
                onSelect = scope.onSelect(),
                onEdit = scope.onEdit && scope.onEdit(),
                minLength = scope.minLength || 2,
                formElement = element[0],
                validationMessage = scope.validationMessage || $translate.instant("SELECT_VALUE_FROM_AUTOCOMPLETE_DEFAULT_MESSAGE"),
                validateIfNeeded = function(value) {
                    scope.strictSelect && (scope.isInvalid = value !== scope.selectedValue, _.isEmpty(value) && (scope.isInvalid = !1))
                };
            scope.$watch("initialValue", function() {
                scope.initialValue && (scope.selectedValue = scope.initialValue, scope.isInvalid = !1)
            }), element.autocomplete({
                autofocus: !0,
                minLength: minLength,
                source: function(request, response) {
                    source({
                        elementId: attrs.id,
                        term: request.term,
                        elementType: attrs.type
                    }).then(function(data) {
                        var results = responseMap ? responseMap(data) : data;
                        response(results)
                    })
                },
                select: function(event, ui) {
                    return scope.selectedValue = ui.item.value, ngModelCtrl.$setViewValue(ui.item.value), null != onSelect && onSelect(ui.item), validateIfNeeded(ui.item.value), scope.blurOnSelect && element.blur(), scope.$apply(), scope.$eval(attrs.ngDisabled), scope.$apply(), !0
                },
                search: function(event, ui) {
                    null != onEdit && onEdit(ui.item);
                    var searchTerm = $.trim(element.val());
                    validateIfNeeded(searchTerm), searchTerm.length < minLength && event.preventDefault()
                }
            });
            var changeHanlder = function(e) {
                    validateIfNeeded(element.val())
                },
                keyUpHandler = function(e) {
                    validateIfNeeded(element.val()), scope.$apply()
                };
            element.on("change", changeHanlder), element.on("keyup", keyUpHandler), scope.$watch("isInvalid", function() {
                ngModelCtrl.$setValidity("selection", !scope.isInvalid), formElement.setCustomValidity(scope.isInvalid ? validationMessage : "")
            }), scope.$on("$destroy", function() {
                element.off("change", changeHanlder), element.off("keyup", keyUpHandler)
            })
        };
        return {
            link: link,
            require: "ngModel",
            scope: {
                source: "&",
                responseMap: "&?",
                onSelect: "&",
                onEdit: "&?",
                minLength: "=?",
                blurOnSelect: "=?",
                strictSelect: "=?",
                validationMessage: "@",
                isInvalid: "=?",
                initialValue: "=?"
            }
        }
    }]), angular.module("bahmni.common.uiHelper").factory("spinner", ["messagingService", "$timeout", function(messagingService, $timeout) {
        var tokens = [],
            topLevelDiv = function(element) {
                return $(element).find("div").eq(0)
            },
            showSpinnerForElement = function(element) {
                return 0 === $(element).find(".dashboard-section-loader").length && topLevelDiv(element).addClass("spinnable").append('<div class="dashboard-section-loader"></div>'), {
                    element: $(element).find(".dashboard-section-loader")
                }
            },
            showSpinnerForOverlay = function() {
                var token = Math.random();
                tokens.push(token), 0 === $("#overlay").length && $("body").prepend('<div id="overlay"><div></div></div>');
                var spinnerElement = $("#overlay");
                return spinnerElement.stop().show(), {
                    element: spinnerElement,
                    token: token
                }
            },
            show = function(element) {
                return void 0 !== element ? showSpinnerForElement(element) : showSpinnerForOverlay()
            },
            hide = function(spinner, parentElement) {
                var spinnerElement = spinner.element;
                spinner.token ? (_.pull(tokens, spinner.token), 0 === tokens.length && spinnerElement.fadeOut(300)) : (topLevelDiv(parentElement).removeClass("spinnable"), spinnerElement && spinnerElement.remove())
            },
            forPromise = function(promise, element) {
                return $timeout(function() {
                    var spinner = show(element);
                    return promise["finally"](function() {
                        hide(spinner, element)
                    }), promise
                })
            },
            forAjaxPromise = function(promise, element) {
                var spinner = show(element);
                return promise.always(function() {
                    hide(spinner, element)
                }), promise
            };
        return {
            forPromise: forPromise,
            forAjaxPromise: forAjaxPromise,
            show: show,
            hide: hide
        }
    }]), angular.module("bahmni.common.uiHelper").factory("printer", ["$rootScope", "$compile", "$http", "$timeout", "$q", "spinner", function($rootScope, $compile, $http, $timeout, $q, spinner) {
        var printHtml = function(html) {
                var deferred = $q.defer(),
                    hiddenFrame = $('<iframe style="visibility: hidden"></iframe>').appendTo("body")[0];
                hiddenFrame.contentWindow.printAndRemove = function() {
                    hiddenFrame.contentWindow.print(), $(hiddenFrame).remove(), deferred.resolve()
                };
                var htmlContent = '<!doctype html><html><body onload="printAndRemove();">' + html + "</body></html>",
                    doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
                return doc.write(htmlContent), doc.close(), deferred.promise
            },
            print = function(templateUrl, data) {
                $rootScope.isBeingPrinted = !0, $http.get(templateUrl).then(function(templateData) {
                    var template = templateData.data,
                        printScope = $rootScope.$new();
                    angular.extend(printScope, data);
                    var element = $compile($("<div>" + template + "</div>"))(printScope),
                        renderAndPrintPromise = $q.defer(),
                        waitForRenderAndPrint = function() {
                            return printScope.$$phase || $http.pendingRequests.length ? $timeout(waitForRenderAndPrint, 1e3) : (printHtml(element.html()).then(function() {
                                $rootScope.isBeingPrinted = !1, renderAndPrintPromise.resolve()
                            }), printScope.$destroy()), renderAndPrintPromise.promise
                        };
                    spinner.forPromise(waitForRenderAndPrint())
                })
            },
            printFromScope = function(templateUrl, scope, afterPrint) {
                $rootScope.isBeingPrinted = !0, $http.get(templateUrl).then(function(response) {
                    var template = response.data,
                        printScope = scope,
                        element = $compile($("<div>" + template + "</div>"))(printScope),
                        renderAndPrintPromise = $q.defer(),
                        waitForRenderAndPrint = function() {
                            return printScope.$$phase || $http.pendingRequests.length ? $timeout(waitForRenderAndPrint) : printHtml(element.html()).then(function() {
                                $rootScope.isBeingPrinted = !1, afterPrint && afterPrint(), renderAndPrintPromise.resolve()
                            }), renderAndPrintPromise.promise
                        };
                    spinner.forPromise(waitForRenderAndPrint())
                })
            };
        return {
            print: print,
            printFromScope: printFromScope
        }
    }]), angular.module("bahmni.common.uiHelper").service("contextChangeHandler", ["$rootScope", function($rootScope) {
        var callbacks = [],
            self = this;
        $rootScope.$on("$stateChangeSuccess", function() {
            self.reset()
        }), this.reset = function() {
            callbacks = []
        }, this.add = function(callback) {
            callbacks.push(callback)
        }, this.execute = function() {
            var allow = !0,
                callBackReturn = null,
                errorMessage = null;
            return callbacks.forEach(function(callback) {
                callBackReturn = callback(), allow = allow && callBackReturn.allow, _.isEmpty(errorMessage) && (errorMessage = callBackReturn.errorMessage)
            }), callBackReturn && errorMessage ? {
                allow: allow,
                errorMessage: errorMessage
            } : {
                allow: allow
            }
        }
    }]), angular.module("bahmni.common.uiHelper").controller("MessageController", ["$scope", "messagingService", function($scope, messagingService) {
        $scope.messages = messagingService.messages, $scope.getMessageText = function(level) {
            var string = "";
            return $scope.messages[level].forEach(function(message) {
                string = string.concat(message.value)
            }), string
        }, $scope.hideMessage = function(level) {
            messagingService.hideMessages(level)
        }, $scope.isErrorMessagePresent = function() {
            return $scope.messages.error.length > 0
        }, $scope.isInfoMessagePresent = function() {
            return $scope.messages.info.length > 0
        }
    }]), angular.module("bahmni.common.uiHelper").service("messagingService", ["$rootScope", "$timeout", function($rootScope, $timeout) {
        this.messages = {
            error: [],
            info: []
        };
        var self = this;
        $rootScope.$on("event:serverError", function(event, errorMessage) {
            self.showMessage("error", errorMessage, "serverError")
        }), this.showMessage = function(level, message, errorEvent) {
            var messageObject = {
                value: "",
                isServerError: !1
            };
            messageObject.value = message, errorEvent ? messageObject.isServerError = !0 : "info" == level && this.createTimeout("info", 4e3);
            var index = _.findIndex(this.messages[level], function(msg) {
                return msg.value == messageObject.value
            });
            index >= 0 && this.messages[level].splice(index, 1), this.messages[level].push(messageObject)
        }, this.createTimeout = function(level, time) {
            $timeout(function() {
                self.messages[level] = []
            }, time, !0)
        }, this.hideMessages = function(level) {
            self.messages[level].length = 0
        }, this.clearAll = function() {
            self.messages.error = [], self.messages.info = []
        }
    }]), angular.module("bahmni.common.uiHelper").directive("ngConfirmClick", function() {
        var link = function(scope, element, attr) {
            var msg = attr.confirmMessage || "Are you sure?",
                clickAction = attr.ngConfirmClick;
            element.bind("click", function() {
                window.confirm(msg) && scope.$apply(clickAction)
            })
        };
        return {
            restrict: "A",
            link: link
        }
    }), angular.module("bahmni.common.uiHelper").directive("bmShow", ["$rootScope", function($rootScope) {
        var link = function($scope, element) {
            $scope.$watch("bmShow", function() {
                $rootScope.isBeingPrinted || $scope.bmShow ? element.removeClass("ng-hide") : element.addClass("ng-hide")
            })
        };
        return {
            scope: {
                bmShow: "="
            },
            link: link
        }
    }]), angular.module("bahmni.common.uiHelper").directive("monthyearpicker", ["$translate", function($translate) {
        var link = function($scope) {
            var monthNames = $translate.instant("MONTHS");
            $scope.monthNames = monthNames.split(",");
            var getYearList = function() {
                for (var minYear = $scope.minYear ? $scope.minYear : moment().toDate().getFullYear() - 15, maxYear = $scope.maxYear ? $scope.maxYear : moment().toDate().getFullYear() + 5, yearList = [], i = maxYear; i >= minYear; i--) yearList.push(i);
                return yearList
            };
            $scope.years = getYearList();
            var valueCompletelyFilled = function() {
                    return null != $scope.selectedMonth && null != $scope.selectedYear
                },
                valueNotFilled = function() {
                    return null == $scope.selectedMonth && null == $scope.selectedYear
                },
                getCompleteDate = function() {
                    var month = $scope.selectedMonth + 1;
                    return $scope.selectedYear + "-" + month + "-01"
                };
            if ($scope.updateModel = function() {
                    valueCompletelyFilled() ? $scope.model = getCompleteDate() : $scope.isValid() ? $scope.model = "" : $scope.model = "Invalid Date"
                }, $scope.isValid = function() {
                    return valueNotFilled() || valueCompletelyFilled()
                }, $scope.illegalMonth = function() {
                    return (void 0 === $scope.selectedMonth || null === $scope.selectedMonth) && null !== $scope.selectedYear && void 0 !== $scope.selectedYear
                }, $scope.illegalYear = function() {
                    return null !== $scope.selectedMonth && void 0 !== $scope.selectedMonth && (void 0 === $scope.selectedYear || null === $scope.selectedYear)
                }, $scope.model) {
                var date = moment($scope.model).toDate();
                $scope.selectedMonth = date.getMonth(), $scope.selectedYear = date.getFullYear()
            }
        };
        return {
            restrict: "E",
            link: link,
            scope: {
                observation: "=",
                minYear: "=",
                maxYear: "=",
                illegalValue: "=",
                model: "="
            },
            template: '<span><select ng-model=\'selectedMonth\'  ng-class="{\'illegalValue\': illegalMonth() || illegalValue}" ng-change="updateModel()" ng-options="monthNames.indexOf(month) as month for month in monthNames" ><option value="">{{\'CHOOSE_MONTH_KEY\' | translate}}</option>></select></span><span><select ng-model=\'selectedYear\'   ng-class="{\'illegalValue\': illegalYear() || illegalValue}" ng-change="updateModel()" ng-options="year as year for year in years"><option value="">{{\'CHOOSE_YEAR_KEY\' | translate}}</option>></select></span>'
        }
    }]), angular.module("bahmni.common.uiHelper").directive("singleClick", function() {
        var ignoreClick = !1,
            link = function(scope, element) {
                var clickHandler = function() {
                    ignoreClick || (ignoreClick = !0, scope.singleClick()["finally"](function() {
                        ignoreClick = !1
                    }))
                };
                element.on("click", clickHandler), scope.$on("$destroy", function() {
                    element.off("click", clickHandler)
                })
            };
        return {
            scope: {
                singleClick: "&"
            },
            restrict: "A",
            link: link
        }
    }), angular.module("bahmni.common.uiHelper").directive("singleSubmit", function() {
        var ignoreSubmit = !1,
            link = function(scope, element) {
                var submitHandler = function() {
                    ignoreSubmit || (ignoreSubmit = !0, scope.singleSubmit()["finally"](function() {
                        ignoreSubmit = !1
                    }))
                };
                element.on("submit", submitHandler), scope.$on("$destroy", function() {
                    element.off("submit", submitHandler)
                })
            };
        return {
            scope: {
                singleSubmit: "&"
            },
            restrict: "A",
            link: link
        }
   }), 
//   angular.module("bahmni.common.uiHelper").directive("npdatepicker", ["$timeout", "$http","visitService",  function($timeout,$http,visitService) {
//        return {
//            restrict: "A",
//            require: "ngModel",
//            link: function($scope, element, attrs, ngModelCtrl) {
//              
//              if (visitService.getgetClaimID() !== null && visitService.getgetClaimID() !== ""){
//               // $scope.$parent.patient['Claim Id']= visitService.getgetClaimID()
//                // var input = angular.element(document.getElementsByTagName("input")[22]);
//                var pos1 = 0;
//                for (var i = 0; i < document.getElementsByTagName("input").length; i++) {
//                    if (document.getElementsByTagName("input")[i].id == 'Claim Id') {
//                        pos1 = i;
//                    }
//                }
//                var input = angular.element(document.getElementsByTagName("input")[pos1]);
//                var model = input.controller('ngModel'); 
//                if (model.$modelValue == undefined){
//                    model.$setViewValue("")
//                }
//                else{
//                    model.$setViewValue(visitService.getgetClaimID());
//                }
//                   
//                model.$render();
//                visitService.setgetClaimID("")
//
//               }
//               else{
//
//                // var input = angular.element(document.getElementsByTagName("input")[22]);
//                var pos1 = 0;
//                for (var i = 0; i < document.getElementsByTagName("input").length; i++) {
//                    if (document.getElementsByTagName("input")[i].id == 'Claim Id') {
//                        pos1 = i;
//                    }
//                }
//                var input = angular.element(document.getElementsByTagName("input")[pos1]);
//                var model = input.controller('ngModel'); 
//                var claim = model.$modelValue
//                if (claim == undefined){
//                    model.$setViewValue("")
//                }
//                else{
//                    model.$setViewValue(claim + ""); 
//                }
//                 
//                   model.$render(); 
//       
//               }
//              
//                $timeout(function() {
//                    attrs.allowFutureDates && (attrs.max = ""), element.nepaliDatePicker({
//                        dateFormat: "%y-%m-%d",
//                        closeOnDateSelect: !0,
//                        minDate: "" !== attrs.min && "undefined" !== attrs.min ? attrs.min : null,
//                        maxDate: "" !== attrs.max && "undefined" !== attrs.max ? attrs.max : null
//                    })
//                }, 400), element.on("dateSelect", function(event) {
//                    element.trigger("input")
//                })
//            }
//        }
//    }]), 

    angular.module("bahmni.common.uiHelper").directive("npdatepicker", ["$timeout", "visitService", function($timeout, visitService) {
        var counter = 0;
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, element, attrs, ngModelCtrl) {
                $timeout(function() {
                    var datepickerOptions = {
                        dateFormat: "%y-%m-%d", 
                        closeOnSelect: true,   
                        minDate: attrs.min && attrs.min !== "" ? attrs.min : null,
                        maxDate: attrs.max && attrs.max !== "" ? attrs.max : null,
                        onChange: function() {
                            var selectedDate = element.val(); 
                            /*
                            var sel = selectedDate.split("-");
                            var nepaliSet = NepaliFunctions.ConvertToUnicode(sel[0]) + "-" +
                                           NepaliFunctions.ConvertToUnicode(sel[1]) + "-" +
                                           NepaliFunctions.ConvertToUnicode(sel[2]);
                            */
                            var valueToSet = selectedDate; // Use raw value or nepaliSet if Unicode is needed
    
                            if (valueToSet !== ngModelCtrl.$modelValue) {
                                scope.$apply(function() {
                                    ngModelCtrl.$setViewValue(valueToSet);
                                    ngModelCtrl.$render();
                                });
                            }
    
                            element.trigger("input");
                        }
                    };
    
                    if (attrs.allowFutureDates) {
                        datepickerOptions.maxDate = null;
                    }
    
                    // Initialize datepicker
                    element.nepaliDatePicker(datepickerOptions);
    
                    var pos = 0;
                    for (var i = 0; i < document.getElementsByTagName("input").length; i++) {
                        if (document.getElementsByTagName("input")[i].id == "NHIS Member Active") {
                            pos = i;
                        }
                    }
    
//                    var actDom = document.getElementsByTagName("input")[pos];
//                    counter = 0;
//                    if (actDom != null) {
//                        var input = angular.element(actDom);
//                        var model = input.controller("ngModel");
//                        model.$setViewValue(false);
//                        model.$render();
//    
//                        actDom.addEventListener("change", function() {
//                            if (attrs.max != null) {
//                                if (this.checked) {
//                                    if (counter === 0) {
//                                        counter = counter + 1;
//                                        var answer = window.confirm("Are you Sure you want to generate new claim code? Once Generate claim code cannot be used again!");
//                                        if (answer) {
//                                            visitService.getClaimCode().then(function(response) {
//                                                var pos1 = 0;
//                                                for (var i = 0; i < document.getElementsByTagName("input").length; i++) {
//                                                    if (document.getElementsByTagName("input")[i].id == "Claim Id") {
//                                                        pos1 = i;
//                                                    }
//                                                }
//                                                var input = angular.element(document.getElementsByTagName("input")[pos1]);
//                                                var model = input.controller("ngModel");
//                                                model.$setViewValue(response.data.claimCode + "");
//                                                model.$render();
//                                            });
//                                        }
//                                    }
//                                } else {
//                                    counter = 0;
//                                    console.log("Checkbox is not checked..");
//                                }
//                            }
//                        });
//                    }
                }, 400);
            }
        };
    }]),
    angular.module("bahmni.common.uiHelper").directive("capitalizeField", ["$parse", function($parse) {
        return {
            require: "ngModel",
            link: function(scope, element, attrs, ngModelController) {
                var capitalize = function(inputValue) {
                    inputValue || (inputValue = "");
                    var capitalized = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
                    return capitalized !== inputValue && (ngModelController.$setViewValue(capitalized), ngModelController.$render()), capitalized
                };
                ngModelController.$parsers.push(capitalize), capitalize($parse(attrs.ngModel)(scope))
            }
        }
    }]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.UIControls = Bahmni.Common.UIControls || {}, angular.module("bahmni.common.uicontrols", []),
    function() {
        var constructSearchResult = function(concept) {
                var conceptName = concept.shortName || concept.name.name || concept.name;
                return {
                    label: conceptName,
                    value: conceptName,
                    concept: concept,
                    uuid: concept.uuid,
                    name: conceptName
                }
            },
            find = function(allAnswers, savedAnswer) {
                return _.find(allAnswers, function(answer) {
                    return savedAnswer && savedAnswer.uuid === answer.concept.uuid
                })
            },
            toBeInjected = ["conceptService"],
            conceptDropdown = function(conceptService) {
                var controller = function($scope) {
                    $scope.onChange = $scope.onChange();
                    var response = function(answers) {
                        $scope.answers = answers, $scope.selectedAnswer = find(answers, $scope.selectedAnswer)
                    };
                    return !$scope.answersConceptName && $scope.defaultConcept ? void conceptService.getAnswers($scope.defaultConcept).then(function(results) {
                        return _.map(results, constructSearchResult)
                    }).then(response) : void conceptService.getAnswersForConceptName({
                        answersConceptName: $scope.answersConceptName
                    }).then(function(results) {
                        return _.map(results, constructSearchResult)
                    }).then(response)
                };
                return {
                    controller: controller,
                    restrict: "E",
                    scope: {
                        selectedAnswer: "=model",
                        answersConceptName: "=?",
                        defaultConcept: "=",
                        onChange: "&",
                        onInvalidClass: "@",
                        isValid: "=",
                        ngDisabled: "="
                    },
                    templateUrl: "../common/uicontrols/concept-dropdown/views/conceptDropdown.html"
                }
            };
        conceptDropdown.$inject = toBeInjected, angular.module("bahmni.common.uicontrols").directive("conceptDropdown", conceptDropdown)
    }(), angular.module("bahmni.common.attributeTypes", []).directive("attributeTypes", [function() {
        return {
            scope: {
                targetModel: "=",
                attribute: "=",
                fieldValidation: "=",
                isAutoComplete: "&",
                getAutoCompleteList: "&",
                getDataResults: "&",
                handleUpdate: "&",
                isReadOnly: "&",
                isForm: "=?"
            },
            templateUrl: "../common/attributeTypes/views/attributeInformation.html",
            restrict: "E",
            controller: function($scope) {
                $scope.getAutoCompleteList = $scope.getAutoCompleteList(), $scope.getDataResults = $scope.getDataResults(), $scope.isAutoComplete = $scope.isAutoComplete() || function() {
                    return !1
                }, $scope.isReadOnly = $scope.isReadOnly() || function() {
                    return !1
                }, $scope.handleUpdate = $scope.handleUpdate() || function() {
                    return !1
                }, $scope.appendConceptNameToModel = function(attribute) {
                    var attributeValueConceptType = $scope.targetModel[attribute.name],
                        concept = _.find(attribute.answers, function(answer) {
                            return answer.conceptId === attributeValueConceptType.conceptUuid
                        });
                    attributeValueConceptType.value = concept && concept.fullySpecifiedName
                }
            }
        }
    }]), angular.module("bahmni.common.photoCapture", []), angular.module("bahmni.common.photoCapture").directive("capturePhoto", ["$parse", "$window", function($parse, $window) {
        var link = function(scope, iElement, iAttrs) {
            var captureActiveStream, captureDialogElement = iElement.find(".photoCaptureDialog"),
                captureVideo = captureDialogElement.find("video")[0],
                captureCanvas = captureDialogElement.find("canvas")[0],
                captureContext = captureCanvas.getContext("2d"),
                captureConfirmImageButton = captureDialogElement.find(".confirmImage"),
                uploadDialogElement = iElement.find(".photoUploadDialog"),
                uploadCanvas = uploadDialogElement.find("canvas")[0],
                uploadContext = uploadCanvas.getContext("2d"),
                uploadConfirmImageButton = uploadDialogElement.find(".confirmImage"),
                uploadField = iElement.find(".fileUpload")[0],
                dialogOpen = !1,
                pixelRatio = window.devicePixelRatio;
            captureContext.scale(pixelRatio, pixelRatio), uploadContext.scale(pixelRatio, pixelRatio);
            var confirmImage = function(canvas, dialogElement) {
                    var image = canvas.toDataURL("image/jpeg"),
                        onConfirmationSuccess = function(image) {
                            var ngModel = $parse(iAttrs.ngModel);
                            ngModel.assign(scope, image), dialogElement.dialog("close")
                        };
                    if (iAttrs.capturePhoto) {
                        var onConfirmationPromise = scope[iAttrs.capturePhoto](image);
                        onConfirmationPromise.then(function() {
                            onConfirmationSuccess(image)
                        }, function() {
                            alert("Failed to save image. Please try again later")
                        })
                    } else onConfirmationSuccess(image)
                },
                drawImage = function(canvas, context, image, imageWidth, imageHeight) {
                    var stretchRatio, sourceWidth, sourceHeight, sourceX = 0,
                        sourceY = 0,
                        destX = 0,
                        destY = 0;
                    canvas.width > canvas.height ? (stretchRatio = imageWidth / canvas.width, sourceWidth = imageWidth, sourceHeight = Math.floor(canvas.height * stretchRatio), sourceY = Math.floor((imageHeight - sourceHeight) / 2)) : (stretchRatio = imageHeight / canvas.height, sourceWidth = Math.floor(canvas.width * stretchRatio), sourceHeight = imageHeight, sourceX = Math.floor((imageWidth - sourceWidth) / 2));
                    var destWidth = Math.floor(canvas.width / pixelRatio),
                        destHeight = Math.floor(canvas.height / pixelRatio);
                    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)
                };
            scope.launchPhotoCapturePopup = function() {
                if (dialogOpen) return void alert("Please allow access to web camera and wait for photo capture dialog to be launched");
                dialogOpen = !0;
                var navigatorUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                navigator.mediaDevices ? navigator.mediaDevices.getUserMedia({
                    video: !0,
                    audio: !1
                }).then(function(localMediaStream) {
                    captureVideo.srcObject = localMediaStream, captureActiveStream = localMediaStream, captureDialogElement.dialog("open")
                })["catch"](function(e) {
                    alert("Could not get access to web camera. Please allow access to web camera")
                }) : navigatorUserMedia ? navigatorUserMedia({
                    video: !0,
                    audio: !1
                }, function(localMediaStream) {
                    captureVideo.src = $window.URL.createObjectURL(localMediaStream), captureActiveStream = localMediaStream, captureDialogElement.dialog("open")
                }, function() {
                    alert("Could not get access to web camera. Please allow access to web camera")
                }) : alert("Photo capture is not supported in your browser. Please use chrome")
            }, scope.captureConfirmImage = function() {
                confirmImage(captureCanvas, captureDialogElement)
            }, scope.captureClickImage = function() {
                drawImage(captureCanvas, captureContext, captureVideo, captureVideo.videoWidth, captureVideo.videoHeight), captureConfirmImageButton.prop("disabled", !1), captureConfirmImageButton.focus()
            }, captureDialogElement.dialog({
                autoOpen: !1,
                height: 300,
                width: 500,
                modal: !0,
                close: function() {
                    if (dialogOpen = !1, captureActiveStream) {
                        var captureActiveStreamTrack = captureActiveStream.getTracks();
                        captureActiveStreamTrack && captureActiveStreamTrack[0].stop()
                    }
                }
            }), scope.uploadConfirmImage = function() {
                confirmImage(uploadCanvas, uploadDialogElement)
            }, scope.launchPhotoUploadPopup = function() {
                return dialogOpen ? void alert("Please wait for photo upload dialog to be launched") : (dialogOpen = !0, void uploadDialogElement.dialog("open"))
            }, scope.uploadImage = function() {
                if (this.files && this.files[0]) {
                    var fileReader = new FileReader;
                    fileReader.onload = function(e) {
                        var image = new Image;
                        image.onload = function() {
                            drawImage(uploadCanvas, uploadContext, image, image.width, image.height)
                        }, image.src = e.target.result
                    }, fileReader.readAsDataURL(this.files[0])
                }
                uploadConfirmImageButton.prop("disabled", !1), uploadConfirmImageButton.focus()
            }, uploadDialogElement.dialog({
                autoOpen: !1,
                height: 350,
                width: 350,
                modal: !0,
                close: function() {
                    dialogOpen = !1
                }
            }), iElement.bind("$destroy", function() {
                captureDialogElement.dialog("destroy"), uploadDialogElement.dialog("destroy")
            }), uploadField.addEventListener("change", scope.uploadImage, !1)
        };
        return {
            templateUrl: "../common/photo-capture/views/photo.html",
            restrict: "A",
            scope: !0,
            link: link
        }
    }]);
var Bahmni = Bahmni || {};
Bahmni.Auth = Bahmni.Auth || {}, angular.module("authentication", ["ui.router"]), Bahmni.Auth.User = function(user) {
    angular.extend(this, user), this.userProperties = user.userProperties || {}, this.favouriteObsTemplates = this.userProperties.favouriteObsTemplates ? this.userProperties.favouriteObsTemplates.split("###") : [], this.favouriteWards = this.userProperties.favouriteWards ? this.userProperties.favouriteWards.split("###") : [], this.recentlyViewedPatients = this.userProperties.recentlyViewedPatients ? JSON.parse(this.userProperties.recentlyViewedPatients) : [], this.toContract = function() {
        var user = angular.copy(this);
        return user.userProperties.favouriteObsTemplates = this.favouriteObsTemplates.join("###"), user.userProperties.favouriteWards = this.favouriteWards.join("###"), user.userProperties.recentlyViewedPatients = JSON.stringify(this.recentlyViewedPatients), delete user.favouriteObsTemplates, delete user.favouriteWards, delete user.recentlyViewedPatients, user
    }, this.addDefaultLocale = function(locale) {
        this.userProperties.defaultLocale = locale
    }, this.addToRecentlyViewed = function(patient, maxPatients) {
        _.some(this.recentlyViewedPatients, {
            uuid: patient.uuid
        }) || (this.recentlyViewedPatients.unshift({
            uuid: patient.uuid,
            name: patient.name,
            identifier: patient.identifier
        }), _.size(this.recentlyViewedPatients) >= maxPatients && (this.recentlyViewedPatients = _.take(this.recentlyViewedPatients, maxPatients)))
    }, this.isFavouriteObsTemplate = function(conceptName) {
        return _.includes(this.favouriteObsTemplates, conceptName)
    }, this.toggleFavoriteObsTemplate = function(conceptName) {
        this.isFavouriteObsTemplate(conceptName) ? this.favouriteObsTemplates = _.without(this.favouriteObsTemplates, conceptName) : this.favouriteObsTemplates.push(conceptName)
    }, this.isFavouriteWard = function(wardName) {
        return _.includes(this.favouriteWards, wardName)
    }, this.toggleFavoriteWard = function(wardName) {
        this.isFavouriteWard(wardName) ? this.favouriteWards = _.without(this.favouriteWards, wardName) : this.favouriteWards.push(wardName)
    }
}, angular.module("authentication").service("userService", ["$rootScope", "$http", "$q", function($rootScope, $http, $q) {
    var getUserFromServer = function(userName) {
        return $http.get(Bahmni.Common.Constants.userUrl, {
            method: "GET",
            params: {
                username: userName,
                v: "custom:(username,uuid,person:(uuid,),privileges:(name,retired),userProperties)"
            },
            cache: !1
        })
    };
    this.getUser = function(userName) {
        var deferrable = $q.defer();
        return getUserFromServer(userName).success(function(data) {
            deferrable.resolve(data)
        }).error(function() {
            deferrable.reject("Unable to get user data")
        }), deferrable.promise
    }, this.savePreferences = function() {
        var deferrable = $q.defer(),
            user = $rootScope.currentUser.toContract();
        return $http.post(Bahmni.Common.Constants.userUrl + "/" + user.uuid, {
            uuid: user.uuid,
            userProperties: user.userProperties
        }, {
            withCredentials: !0
        }).then(function(response) {
            $rootScope.currentUser.userProperties = response.data.userProperties, deferrable.resolve()
        }), deferrable.promise
    };
    var getProviderFromServer = function(uuid) {
        return $http.get(Bahmni.Common.Constants.providerUrl, {
            method: "GET",
            params: {
                user: uuid
            },
            cache: !1
        })
    };
    this.getProviderForUser = function(uuid) {
        var deferrable = $q.defer();
        return getProviderFromServer(uuid).success(function(data) {
            if (data.results.length > 0) {
                var providerName = data.results[0].display.split("-")[1];
                data.results[0].name = providerName ? providerName.trim() : providerName, deferrable.resolve(data)
            } else deferrable.reject("UNABLE_TO_GET_PROVIDER_DATA")
        }).error(function() {
            deferrable.reject("UNABLE_TO_GET_PROVIDER_DATA")
        }), deferrable.promise
    }, this.getPasswordPolicies = function() {
        return $http.get(Bahmni.Common.Constants.passwordPolicyUrl, {
            method: "GET",
            withCredentials: !0
        })
    }
}]), angular.module("authentication").config(["$httpProvider", function($httpProvider) {
    var interceptor = ["$rootScope", "$q", function($rootScope, $q) {
        function success(response) {
            return response
        }

        function error(response) {
            return 401 === response.status && $rootScope.$broadcast("event:auth-loginRequired"), $q.reject(response)
        }
        return {
            response: success,
            responseError: error
        }
    }];
    $httpProvider.interceptors.push(interceptor)
}]).run(["$rootScope", "$window", "$timeout", function($rootScope, $window, $timeout) {
    $rootScope.$on("event:auth-loginRequired", function() {
        $timeout(function() {
            $window.location = "../home/index.html#/login"
        })
    })
}]).service("sessionService", ["$rootScope", "$http", "$q", "$bahmniCookieStore", "userService", function($rootScope, $http, $q, $bahmniCookieStore, userService) {
    var sessionResourcePath = Bahmni.Common.Constants.RESTWS_V1 + "/session?v=custom:(uuid)",
        getAuthFromServer = function(username, password, otp) {
            var btoa = otp ? username + ":" + password + ":" + otp : username + ":" + password;
            return $http.get(sessionResourcePath, {
                headers: {
                    Authorization: "Basic " + window.btoa(btoa)
                },
                cache: !1
            })
        };
    this.resendOTP = function(username, password) {
        var btoa = username + ":" + password;
        return $http.get(sessionResourcePath + "&resendOTP=true", {
            headers: {
                Authorization: "Basic " + window.btoa(btoa)
            },
            cache: !1
        })
    };
    var createSession = function(username, password, otp) {
            var deferrable = $q.defer();
            return destroySessionFromServer().success(function() {
                getAuthFromServer(username, password, otp).then(function(response) {
                    204 == response.status && deferrable.resolve({
                        firstFactAuthorization: !0
                    }), deferrable.resolve(response.data)
                }, function(response) {
                    401 == response.status ? deferrable.reject("LOGIN_LABEL_WRONG_OTP_MESSAGE_KEY") : 410 == response.status ? deferrable.reject("LOGIN_LABEL_OTP_EXPIRED") : 429 == response.status && deferrable.reject("LOGIN_LABEL_MAX_FAILED_ATTEMPTS"), deferrable.reject("LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY")
                })
            }).error(function() {
                deferrable.reject("LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY")
            }), deferrable.promise
        },
        hasAnyActiveProvider = function(providers) {
            return _.filter(providers, function(provider) {
                return void 0 == provider.retired || "false" == provider.retired
            }).length > 0
        },
        self = this,
        destroySessionFromServer = function() {
            return $http["delete"](sessionResourcePath)
        },
        sessionCleanup = function() {
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {
                path: "/"
            }), delete $.cookie(Bahmni.Common.Constants.currentUser, null, {
                path: "/"
            }), delete $.cookie(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, null, {
                path: "/"
            }), delete $.cookie(Bahmni.Common.Constants.grantProviderAccessDataCookieName, null, {
                path: "/"
            }), $rootScope.currentUser = void 0
        };
    this.destroy = function() {
        var deferrable = $q.defer();
        return destroySessionFromServer().then(function() {
            sessionCleanup(), deferrable.resolve()
        }), deferrable.promise
    }, this.loginUser = function(username, password, location, otp) {
        var deferrable = $q.defer();
        return createSession(username, password, otp).then(function(data) {
            data.authenticated ? ($bahmniCookieStore.put(Bahmni.Common.Constants.currentUser, username, {
                path: "/",
                expires: 7
            }), void 0 != location && ($bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName), $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {
                name: location.display,
                uuid: location.uuid
            }, {
                path: "/",
                expires: 7
            })), deferrable.resolve(data)) : data.firstFactAuthorization ? deferrable.resolve(data) : deferrable.reject("LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY")
        }, function(errorInfo) {
            deferrable.reject(errorInfo)
        }), deferrable.promise
    }, this.get = function() {
        return $http.get(sessionResourcePath, {
            cache: !1
        })
    }, this.loadCredentials = function() {
        var deferrable = $q.defer(),
            currentUser = $bahmniCookieStore.get(Bahmni.Common.Constants.currentUser);
        return currentUser ? (userService.getUser(currentUser).then(function(data) {
            userService.getProviderForUser(data.results[0].uuid).then(function(providers) {
                !_.isEmpty(providers.results) && hasAnyActiveProvider(providers.results) ? ($rootScope.currentUser = new Bahmni.Auth.User(data.results[0]), $rootScope.currentUser.currentLocation = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).name, $rootScope.$broadcast("event:user-credentialsLoaded", data.results[0]), deferrable.resolve(data.results[0])) : (self.destroy(), deferrable.reject("YOU_HAVE_NOT_BEEN_SETUP_PROVIDER"))
            }, function() {
                self.destroy(), deferrable.reject("COULD_NOT_GET_PROVIDER")
            })
        }, function() {
            self.destroy(), deferrable.reject("Could not get roles for the current user.")
        }), deferrable.promise) : (this.destroy()["finally"](function() {
            $rootScope.$broadcast("event:auth-loginRequired"), deferrable.reject("No User in session. Please login again.")
        }), deferrable.promise)
    }, this.getLoginLocationUuid = function() {
        return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null
    }, this.changePassword = function(currentUserUuid, oldPassword, newPassword) {
        return $http({
            method: "POST",
            url: Bahmni.Common.Constants.passwordUrl,
            data: {
                oldPassword: oldPassword,
                newPassword: newPassword
            },
            headers: {
                "Content-Type": "application/json"
            }
        })
    }, this.loadProviders = function(userInfo) {
        return $http.get(Bahmni.Common.Constants.providerUrl, {
            method: "GET",
            params: {
                user: userInfo.uuid
            },
            cache: !1
        }).success(function(data) {
            var providerUuid = data.results.length > 0 ? data.results[0].uuid : void 0;
            $rootScope.currentProvider = {
                uuid: providerUuid
            }
        })
    }
}]).factory("authenticator", ["$rootScope", "$q", "$window", "sessionService", function($rootScope, $q, $window, sessionService) {
    var authenticateUser = function() {
        var defer = $q.defer(),
            sessionDetails = sessionService.get();
        return sessionDetails.then(function(response) {
            response.data.authenticated ? defer.resolve() : (defer.reject("User not authenticated"), $rootScope.$broadcast("event:auth-loginRequired"))
        }), defer.promise
    };
    return {
        authenticateUser: authenticateUser
    }
}]).directive("logOut", ["sessionService", "$window", "configurationService", "auditLogService", function(sessionService, $window, configurationService, auditLogService) {
    return {
        link: function(scope, element) {
            element.bind("click", function() {
                scope.$apply(function() {
                    auditLogService.log(void 0, "USER_LOGOUT_SUCCESS", void 0, "MODULE_LABEL_LOGOUT_KEY").then(function() {
                        sessionService.destroy().then(function() {
                            $window.location = "../home/index.html#/login"
                        })
                    })
                })
            })
        }
    }
}]).directive("btnUserInfo", [function() {
    return {
        restrict: "CA",
        link: function(scope, elem) {
            elem.bind("click", function(event) {
                $(this).next().toggleClass("active"), event.stopPropagation()
            }), $(document).find("body").bind("click", function() {
                $(elem).next().removeClass("active")
            })
        }
    }
}]), angular.module("bahmni.common.appFramework", ["authentication"]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.AppFramework = Bahmni.Common.AppFramework || {}, Bahmni.Common.AppFramework.AppDescriptor = function(context, inheritContext, retrieveUserCallback, mergeService) {
    this.id = null, this.instanceOf = null, this.description = null, this.contextModel = null, this.baseExtensionPoints = [], this.customExtensionPoints = [], this.baseExtensions = {}, this.customExtensions = {}, this.customConfigs = {}, this.baseConfigs = {}, this.extensionPath = context, this.contextPath = inheritContext ? context.split("/")[0] : context;
    var self = this,
        setExtensionPointsFromExtensions = function(currentExtensions, currentExtensionPoints) {
            _.values(currentExtensions).forEach(function(extn) {
                if (extn) {
                    var existing = self[currentExtensionPoints].filter(function(ep) {
                        return ep.id === extn.extensionPointId
                    });
                    0 === existing.length && self[currentExtensionPoints].push({
                        id: extn.extensionPointId,
                        description: extn.description
                    })
                }
            })
        };
    this.setExtensions = function(baseExtensions, customExtensions) {
        customExtensions && (setExtensionPointsFromExtensions(customExtensions, "customExtensionPoints"), self.customExtensions = customExtensions), self.baseExtensions = baseExtensions, setExtensionPointsFromExtensions(baseExtensions, "baseExtensionPoints")
    }, this.setTemplate = function(template) {
        self.instanceOf = template.id, self.description = self.description || template.description, self.contextModel = self.contextModel || template.contextModel, template.configOptions && _.values(template.configOptions).forEach(function(opt) {
            var existing = self.configs.filter(function(cfg) {
                return cfg.name === opt.name
            });
            existing.length > 0 ? existing[0].description = opt.description : self.configs.push({
                name: opt.name,
                description: opt.description,
                value: opt.defaultValue
            })
        })
    };
    var setConfig = function(instance, currentConfig) {
            for (var configName in instance.config) {
                var existingConfig = getConfig(self[currentConfig], configName);
                existingConfig ? existingConfig.value = instance.config[configName] : self[currentConfig][configName] = {
                    name: configName,
                    value: instance.config[configName]
                }
            }
        },
        setDefinitionExtensionPoints = function(extensionPoints, currentExtensionPoints) {
            extensionPoints && extensionPoints.forEach(function(iep) {
                if (iep) {
                    var existing = self[currentExtensionPoints].filter(function(ep) {
                        return ep.id === iep.id
                    });
                    0 === existing.length && self[currentExtensionPoints].push(iep)
                }
            })
        };
    this.setDefinition = function(baseInstance, customInstance) {
        self.instanceOf = customInstance && customInstance.instanceOf ? customInstance.instanceOf : baseInstance.instanceOf, self.id = customInstance && customInstance.id ? customInstance.id : baseInstance.id, self.description = customInstance && customInstance.description ? customInstance.description : baseInstance.description, self.contextModel = customInstance && customInstance.contextModel ? customInstance.contextModel : baseInstance.contextModel, setDefinitionExtensionPoints(baseInstance.extensionPoints, "baseExtensionPoints"), setConfig(baseInstance, "baseConfigs"), customInstance && (setDefinitionExtensionPoints(customInstance.extensionPoints, "customExtensionPoints"), setConfig(customInstance, "customConfigs"))
    };
    var getExtensions = function(extPointId, type, extensions) {
        var currentUser = retrieveUserCallback(),
            currentExtensions = _.values(extensions);
        if (currentUser && currentExtensions) {
            var extnType = type || "all",
                userPrivileges = currentUser.privileges.map(function(priv) {
                    return priv.retired ? "" : priv.name
                }),
                appsExtns = currentExtensions.filter(function(extn) {
                    return ("all" === extnType || extn.type === extnType) && extn.extensionPointId === extPointId && (!extn.requiredPrivilege || userPrivileges.indexOf(extn.requiredPrivilege) >= 0)
                });
            return appsExtns.sort(function(extn1, extn2) {
                return extn1.order - extn2.order
            }), appsExtns
        }
    };
    this.getExtensions = function(extPointId, type, shouldMerge) {
        if (shouldMerge || void 0 === shouldMerge) {
            var mergedExtensions = mergeService.merge(self.baseExtensions, self.customExtensions);
            return getExtensions(extPointId, type, mergedExtensions)
        }
        return [getExtensions(extPointId, type, self.baseExtensions), getExtensions(extPointId, type, self.customExtensions)]
    }, this.getExtensionById = function(id, shouldMerge) {
        if (shouldMerge || void 0 === shouldMerge) {
            var mergedExtensions = _.values(mergeService.merge(self.baseExtensions, self.customExtensions));
            return mergedExtensions.filter(function(extn) {
                return extn.id === id
            })[0]
        }
        return [self.baseExtensions.filter(function(extn) {
            return extn.id === id
        })[0], self.customExtensions.filter(function(extn) {
            return extn.id === id
        })[0]]
    };
    var getConfig = function(config, configName) {
        var cfgList = _.values(config).filter(function(cfg) {
            return cfg.name === configName
        });
        return cfgList.length > 0 ? cfgList[0] : null
    };
    this.getConfig = function(configName, shouldMerge) {
        return shouldMerge || void 0 === shouldMerge ? getConfig(mergeService.merge(self.baseConfigs, self.customConfigs), configName) : [getConfig(self.baseConfigs, configName), getConfig(self.customConfigs, configName)]
    }, this.getConfigValue = function(configName, shouldMerge) {
        var config = this.getConfig(configName, shouldMerge);
        return shouldMerge || void 0 === shouldMerge ? config ? config.value : null : config
    }, this.formatUrl = function(url, options, useQueryParams) {
        var pattern = /{{([^}]*)}}/g,
            matches = url.match(pattern),
            replacedString = url,
            checkQueryParams = useQueryParams || !1,
            queryParameters = this.parseQueryParams();
        return matches && matches.forEach(function(el) {
            var key = el.replace("{{", "").replace("}}", ""),
                value = options[key];
            value || checkQueryParams !== !0 || (value = queryParameters[key] || null), replacedString = replacedString.replace(el, value)
        }), replacedString.trim()
    }, this.parseQueryParams = function(locationSearchString) {
        var urlParams, match, pl = /\+/g,
            search = /([^&=]+)=?([^&]*)/g,
            decode = function(s) {
                return decodeURIComponent(s.replace(pl, " "))
            },
            queryString = locationSearchString || window.location.search.substring(1);
        for (urlParams = {}; match = search.exec(queryString);) urlParams[decode(match[1])] = decode(match[2]);
        return urlParams
    }, this.addConfigForPage = function(pageName, baseConfig, customConfig) {
        self.basePageConfigs = self.basePageConfigs || {}, self.basePageConfigs[pageName] = baseConfig, self.customPageConfigs = self.customPageConfigs || {}, self.customPageConfigs[pageName] = customConfig
    }, this.getConfigForPage = function(pageName, shouldMerge) {
        return shouldMerge || void 0 === shouldMerge ? mergeService.merge(self.basePageConfigs[pageName], self.customPageConfigs[pageName]) : [_.values(self.basePageConfigs[pageName]), _.values(self.customPageConfigs[pageName])]
    }
}, angular.module("bahmni.common.appFramework").config(["$compileProvider", function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/)
}]).service("appService", ["$http", "$q", "sessionService", "$rootScope", "mergeService", "loadConfigService", "messagingService", "$translate", function($http, $q, sessionService, $rootScope, mergeService, loadConfigService, messagingService, $translate) {
    var currentUser = null,
        baseUrl = Bahmni.Common.Constants.baseUrl,
        customUrl = Bahmni.Common.Constants.customUrl,
        appDescriptor = null,
        loadConfig = function(url) {
            return loadConfigService.loadConfig(url, appDescriptor.contextPath)
        },
        loadTemplate = function(appDescriptor) {
            var deferrable = $q.defer();
            return loadConfig(baseUrl + appDescriptor.contextPath + "/appTemplate.json").then(function(result) {
                _.keys(result.data).length > 0 && appDescriptor.setTemplate(result.data), deferrable.resolve(appDescriptor)
            }, function(error) {
                404 !== error.status ? deferrable.reject(error) : deferrable.resolve(appDescriptor)
            }), deferrable.promise
        },
        setDefinition = function(baseResultData, customResultData) {
            customResultData && (_.keys(baseResultData).length > 0 || _.keys(customResultData.length > 0)) ? appDescriptor.setDefinition(baseResultData, customResultData) : _.keys(baseResultData).length > 0 && appDescriptor.setDefinition(baseResultData)
        },
        loadDefinition = function(appDescriptor) {
            var deferrable = $q.defer();
            return loadConfig(baseUrl + appDescriptor.contextPath + "/app.json").then(function(baseResult) {
                baseResult.data.shouldOverRideConfig ? loadConfig(customUrl + appDescriptor.contextPath + "/app.json").then(function(customResult) {
                    setDefinition(baseResult.data, customResult.data), deferrable.resolve(appDescriptor)
                }, function() {
                    setDefinition(baseResult.data), deferrable.resolve(appDescriptor)
                }) : (setDefinition(baseResult.data), deferrable.resolve(appDescriptor))
            }, function(error) {
                404 !== error.status ? deferrable.reject(error) : deferrable.resolve(appDescriptor)
            }), deferrable.promise
        },
        setExtensions = function(baseResultData, customResultData) {
            customResultData ? appDescriptor.setExtensions(baseResultData, customResultData) : appDescriptor.setExtensions(baseResultData)
        },
        loadExtensions = function(appDescriptor, extensionFileName) {
            var deferrable = $q.defer();
            return loadConfig(baseUrl + appDescriptor.extensionPath + extensionFileName).then(function(baseResult) {
                baseResult.data.shouldOverRideConfig ? loadConfig(customUrl + appDescriptor.extensionPath + extensionFileName).then(function(customResult) {
                    setExtensions(baseResult.data, customResult.data), deferrable.resolve(appDescriptor)
                }, function() {
                    setExtensions(baseResult.data), deferrable.resolve(appDescriptor)
                }) : (setExtensions(baseResult.data), deferrable.resolve(appDescriptor))
            }, function(error) {
                404 !== error.status ? deferrable.reject(error) : deferrable.resolve(appDescriptor)
            }), deferrable.promise
        },
        setDefaultPageConfig = function(pageName, baseResultData, customResultData) {
            customResultData && (_.keys(customResultData).length > 0 || _.keys(baseResultData).length > 0) ? appDescriptor.addConfigForPage(pageName, baseResultData, customResultData) : _.keys(baseResultData).length > 0 && appDescriptor.addConfigForPage(pageName, baseResultData)
        },
        hasPrivilegeOf = function(privilegeName) {
            return _.some(currentUser.privileges, {
                name: privilegeName
            })
        },
        loadPageConfig = function(pageName, appDescriptor) {
            var deferrable = $q.defer();
            return loadConfig(baseUrl + appDescriptor.contextPath + "/" + pageName + ".json").then(function(baseResult) {
                baseResult.data.shouldOverRideConfig ? loadConfig(customUrl + appDescriptor.contextPath + "/" + pageName + ".json").then(function(customResult) {
                    setDefaultPageConfig(pageName, baseResult.data, customResult.data), deferrable.resolve(appDescriptor)
                }, function() {
                    setDefaultPageConfig(pageName, baseResult.data), deferrable.resolve(appDescriptor)
                }) : (setDefaultPageConfig(pageName, baseResult.data), deferrable.resolve(appDescriptor))
            }, function(error) {
                404 !== error.status ? (messagingService.showMessage("error", "Incorrect Configuration:  " + error.message), deferrable.reject(error)) : deferrable.resolve(appDescriptor)
            }), deferrable.promise
        };
    this.getAppDescriptor = function() {
        return appDescriptor
    }, this.configBaseUrl = function() {
        return baseUrl
    }, this.loadCsvFileFromConfig = function(name) {
        return loadConfig(baseUrl + appDescriptor.contextPath + "/" + name)
    }, this.loadConfig = function(name, shouldMerge) {
        return loadConfig(baseUrl + appDescriptor.contextPath + "/" + name).then(function(baseResponse) {
            return baseResponse.data.shouldOverRideConfig ? loadConfig(customUrl + appDescriptor.contextPath + "/" + name).then(function(customResponse) {
                return shouldMerge || void 0 === shouldMerge ? mergeService.merge(baseResponse.data, customResponse.data) : [baseResponse.data, customResponse.data]
            }, function() {
                return baseResponse.data
            }) : baseResponse.data
        })
    }, this.loadMandatoryConfig = function(path) {
        return $http.get(path)
    }, this.getAppName = function() {
        return this.appName
    }, this.checkPrivilege = function(privilegeName) {
        return hasPrivilegeOf(privilegeName) ? $q.when(!0) : (messagingService.showMessage("error", $translate.instant(Bahmni.Common.Constants.privilegeRequiredErrorMessage) + " [Privileges required: " + privilegeName + "]"), $q.reject())
    }, this.initApp = function(appName, options, extensionFileSuffix, configPages) {
        this.appName = appName;
        var appLoader = $q.defer(),
            extensionFileName = extensionFileSuffix && "default" !== extensionFileSuffix.toLowerCase() ? "/extension-" + extensionFileSuffix + ".json" : "/extension.json",
            promises = [],
            opts = options || {
                app: !0,
                extension: !0
            },
            inheritAppContext = !opts.inherit || opts.inherit;
        appDescriptor = new Bahmni.Common.AppFramework.AppDescriptor(appName, inheritAppContext, function() {
            return currentUser
        }, mergeService);
        var loadCredentialsPromise = sessionService.loadCredentials(),
            loadProviderPromise = loadCredentialsPromise.then(sessionService.loadProviders);
        return promises.push(loadCredentialsPromise), promises.push(loadProviderPromise), opts.extension && promises.push(loadExtensions(appDescriptor, extensionFileName)), opts.template && promises.push(loadTemplate(appDescriptor)), opts.app && promises.push(loadDefinition(appDescriptor)), _.isEmpty(configPages) || configPages.forEach(function(configPage) {
            promises.push(loadPageConfig(configPage, appDescriptor))
        }), $q.all(promises).then(function(results) {
            currentUser = results[0], appLoader.resolve(appDescriptor), $rootScope.$broadcast("event:appExtensions-loaded")
        }, function(errors) {
            appLoader.reject(errors)
        }), appLoader.promise
    }
}]), angular.module("bahmni.common.appFramework").service("mergeService", [function() {
    this.merge = function(base, custom) {
        var mergeResult = $.extend(!0, {}, base, custom);
        return deleteNullValuedKeys(mergeResult)
    };
    var deleteNullValuedKeys = function(currentObject) {
        return _.forOwn(currentObject, function(value, key) {
            (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) || _.isObject(value) && _.isNull(deleteNullValuedKeys(value))) && delete currentObject[key]
        }), currentObject
    }
}]), angular.module("bahmni.common.patient", []), angular.module("bahmni.common.patient").filter("age", function() {
    return function(age) {
        return age.years ? age.years + " y" : age.months ? age.months + " m" : age.days + " d"
    }
});
var Bahmni = Bahmni || {};
Bahmni.ConceptSet = Bahmni.ConceptSet || {}, Bahmni.ConceptSet.FormConditions = Bahmni.ConceptSet.FormConditions || {}, angular.module("bahmni.common.conceptSet", ["bahmni.common.uiHelper", "ui.select2", "pasvaz.bindonce", "ngSanitize", "ngTagsInput"]), angular.module("bahmni.common.conceptSet").controller("ConceptSetGroupController", ["$scope", "contextChangeHandler", "spinner", "messagingService", "conceptSetService", "$rootScope", "sessionService", "encounterService", "treatmentConfig", "retrospectiveEntryService", "userService", "conceptSetUiConfigService", "$timeout", "clinicalAppConfigService", "$stateParams", "$translate", "appService", function($scope, contextChangeHandler, spinner, messagingService, conceptSetService, $rootScope, sessionService, encounterService, treatmentConfig, retrospectiveEntryService, userService, conceptSetUiConfigService, $timeout, clinicalAppConfigService, $stateParams, $translate, appService) {
        var conceptSetUIConfig = conceptSetUiConfigService.getConfig();
        $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates");
        var init = function() {
            $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler($scope.allTemplates), contextChangeHandler.add($scope.validationHandler.validate)
        };
        $scope.toggleSideBar = function() {
            $rootScope.showLeftpanelToggle = !$rootScope.showLeftpanelToggle
        }, $scope.showLeftpanelToggle = function() {
            return $rootScope.showLeftpanelToggle
        }, $scope.togglePref = function(conceptSet, conceptName) {
            $rootScope.currentUser.toggleFavoriteObsTemplate(conceptName), spinner.forPromise(userService.savePreferences())
        }, $scope.getNormalized = function(conceptName) {
            return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_")
        }, $scope.showPreviousButton = function(conceptSetName) {
            return conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].showPreviousButton
        }, $scope.showPrevious = function(conceptSetName, event) {
            event.stopPropagation(), $timeout(function() {
                $scope.$broadcast("event:showPrevious" + conceptSetName)
            })
        }, $scope.isInEditEncounterMode = function() {
            return void 0 !== $stateParams.encounterUuid && "active" !== $stateParams.encounterUuid
        }, $scope.computeField = function(conceptSet, event) {
            event.stopPropagation(), $scope.consultation.preSaveHandler.fire();
            var defaultRetrospectiveVisitType = clinicalAppConfigService.getVisitTypeForRetrospectiveEntries(),
                encounterData = (new Bahmni.Clinical.EncounterTransactionMapper).map(angular.copy($scope.consultation), $scope.patient, sessionService.getLoginLocationUuid(), retrospectiveEntryService.getRetrospectiveEntry(), defaultRetrospectiveVisitType, $scope.isInEditEncounterMode());
            encounterData = encounterService.buildEncounter(encounterData), encounterData.drugOrders = [];
            var conceptSetData = {
                    name: conceptSet.conceptName,
                    uuid: conceptSet.uuid
                },
                data = {
                    encounterModifierObservations: encounterData.observations,
                    drugOrders: encounterData.drugOrders,
                    conceptSetData: conceptSetData,
                    patientUuid: encounterData.patientUuid,
                    encounterDateTime: encounterData.encounterDateTime
                };
            spinner.forPromise(treatmentConfig().then(function(treatmentConfig) {
                return $scope.treatmentConfiguration = treatmentConfig, conceptSetService.getComputedValue(data)
            }).then(function(response) {
                response = response.data, copyValues($scope.consultation.observations, response.encounterModifierObservations), $scope.consultation.newlyAddedTreatments = $scope.consultation.newlyAddedTreatments || [], response.drugOrders.forEach(function(drugOrder) {
                    $scope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, $scope.treatmentConfiguration))
                })
            }))
        }, $scope.canRemove = function(index) {
            var observations = $scope.allTemplates[index].observations;
            return !(void 0 !== observations && !_.isEmpty(observations)) || void 0 === observations[0].uuid
        }, $scope.clone = function(index) {
            var clonedObj = $scope.allTemplates[index].clone();
            $scope.allTemplates.splice(index + 1, 0, clonedObj), $.scrollTo("#concept-set-" + (index + 1), 200, {
                offset: {
                    top: -400
                }
            })
        }, $scope.clonePanelConceptSet = function(conceptSet) {
            var index = _.findIndex($scope.allTemplates, conceptSet);
            messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_ADDED_SUCCESS_KEY", {
                label: $scope.allTemplates[index].label
            })), $scope.clone(index), $scope.showLeftPanelConceptSet($scope.allTemplates[index + 1])
        }, $scope.isClonedSection = function(conceptSetTemplate, allTemplates) {
            if (allTemplates) {
                var index = allTemplates.indexOf(conceptSetTemplate);
                return index > 0 && allTemplates[index].label == allTemplates[index - 1].label
            }
            return !1
        }, $scope.isLastClonedSection = function(conceptSetTemplate) {
            var index = _.findIndex($scope.allTemplates, conceptSetTemplate);
            return !(!$scope.allTemplates || index != $scope.allTemplates.length - 1 && $scope.allTemplates[index].label == $scope.allTemplates[index + 1].label)
        }, $scope.remove = function(index) {
            var label = $scope.allTemplates[index].label,
                currentTemplate = $scope.allTemplates[index],
                anotherTemplate = _.find($scope.allTemplates, function(template) {
                    return template.label == currentTemplate.label && template !== currentTemplate
                });
            if (anotherTemplate) $scope.allTemplates.splice(index, 1);
            else {
                $scope.allTemplates[index].isAdded = !1;
                var clonedObj = $scope.allTemplates[index].clone();
                $scope.allTemplates[index] = clonedObj, $scope.allTemplates[index].isAdded = !1, $scope.allTemplates[index].isOpen = !1, $scope.allTemplates[index].klass = "", $scope.allTemplates[index].isLoaded = !1
            }
            $scope.leftPanelConceptSet = "", messagingService.showMessage("info", $translate.instant("CLINICAL_TEMPLATE_REMOVED_SUCCESS_KEY", {
                label: label
            }))
        }, $scope.openActiveForm = function(conceptSet) {
            return conceptSet && "active" == conceptSet.klass && conceptSet != $scope.leftPanelConceptSet && $scope.showLeftPanelConceptSet(conceptSet), conceptSet.klass
        };
        var copyValues = function(existingObservations, modifiedObservations) {
                existingObservations.forEach(function(observation, index) {
                    observation.groupMembers && observation.groupMembers.length > 0 ? copyValues(observation.groupMembers, modifiedObservations[index].groupMembers) : observation.value = modifiedObservations[index].value
                })
            },
            collapseExistingActiveSection = function(section) {
                section && (section.klass = "", section.isOpen = !1, section.isLoaded = !1)
            };
        $scope.showLeftPanelConceptSet = function(selectedConceptSet) {
            collapseExistingActiveSection($scope.leftPanelConceptSet), $scope.leftPanelConceptSet = selectedConceptSet, $scope.leftPanelConceptSet.isOpen = !0, $scope.leftPanelConceptSet.isLoaded = !0, $scope.leftPanelConceptSet.klass = "active", $scope.leftPanelConceptSet.atLeastOneValueIsSet = selectedConceptSet.hasSomeValue(), $scope.leftPanelConceptSet.isAdded = !0, $scope.consultation.lastvisited = selectedConceptSet.id || selectedConceptSet.formUuid, $(window).scrollTop(0)
        }, $scope.focusOnErrors = function() {
            var errorMessage = $scope.leftPanelConceptSet.errorMessage ? $scope.leftPanelConceptSet.errorMessage : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
            messagingService.showMessage("error", errorMessage), $scope.$parent.$parent.$broadcast("event:errorsOnForm")
        }, $scope.isFormTemplate = function(data) {
            return data.formUuid
        }, init()
    }]).directive("conceptSetGroup", function() {
        return {
            restrict: "EA",
            scope: {
                conceptSetGroupExtensionId: "=?",
                observations: "=",
                allTemplates: "=",
                context: "=",
                autoScrollEnabled: "=",
                patient: "=",
                consultation: "="
            },
            controller: "ConceptSetGroupController",
            templateUrl: "../common/concept-set/views/conceptSetGroup.html"
        }
    }), angular.module("bahmni.common.conceptSet").directive("conceptSet", ["contextChangeHandler", "appService", "observationsService", "messagingService", "conceptSetService", "conceptSetUiConfigService", "spinner", function(contextChangeHandler, appService, observationsService, messagingService, conceptSetService, conceptSetUiConfigService, spinner) {
        var controller = function($scope) {
            var conceptSetName = $scope.conceptSetName,
                ObservationUtil = Bahmni.Common.Obs.ObservationUtil,
                conceptSetUIConfig = conceptSetUiConfigService.getConfig(),
                observationMapper = new Bahmni.ConceptSet.ObservationMapper,
                validationHandler = $scope.validationHandler() || contextChangeHandler,
                id = "#" + $scope.sectionId;
            $scope.atLeastOneValueIsSet = $scope.atLeastOneValueIsSet || !1, $scope.conceptSetRequired = !1, $scope.showTitleValue = $scope.showTitle(), $scope.numberOfVisits = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].numberOfVisits ? conceptSetUIConfig[conceptSetName].numberOfVisits : null, $scope.hideAbnormalButton = conceptSetUIConfig[conceptSetName] && conceptSetUIConfig[conceptSetName].hideAbnormalButton;
            var focusFirstObs = function() {
                    if ($scope.conceptSetFocused && $scope.rootObservation.groupMembers && $scope.rootObservation.groupMembers.length > 0) {
                        var firstObs = _.find($scope.rootObservation.groupMembers, function(obs) {
                            return obs.isFormElement && obs.isFormElement()
                        });
                        firstObs && (firstObs.isFocused = !0)
                    }
                },
                updateObservationsOnRootScope = function() {
                    if ($scope.rootObservation) {
                        for (var i = 0; i < $scope.observations.length; i++)
                            if ($scope.observations[i].concept.uuid === $scope.rootObservation.concept.uuid) return void($scope.observations[i] = $scope.rootObservation);
                        $scope.observations.push($scope.rootObservation)
                    }
                },
                getObservationsOfCurrentTemplate = function() {
                    return _.filter($scope.observations, function(observation) {
                        return _.toLower(observation.conceptSetName) === _.toLower($scope.rootObservation.concept.name)
                    })
                },
                getDefaults = function() {
                    var conceptSetUI = appService.getAppDescriptor().getConfigValue("conceptSetUI");
                    if (conceptSetUI && conceptSetUI.defaults) return conceptSetUI.defaults || {}
                },
                getCodedAnswerWithDefaultAnswerString = function(defaults, groupMember) {
                    var defaultCodedAnswer, possibleAnswers = groupMember.possibleAnswers,
                        defaultAnswer = defaults[groupMember.concept.name];
                    return defaultAnswer instanceof Array ? (defaultCodedAnswer = [], _.each(defaultAnswer, function(answer) {
                        defaultCodedAnswer.push(_.find(possibleAnswers, {
                            displayString: answer
                        }))
                    })) : defaultCodedAnswer = _.find(possibleAnswers, {
                        displayString: defaultAnswer
                    }), defaultCodedAnswer
                },
                setDefaultsForGroupMembers = function(groupMembers, defaults) {
                    defaults && _.each(groupMembers, function(groupMember) {
                        var conceptFullName = groupMember.concept.name,
                            present = _.includes(_.keys(defaults), conceptFullName);
                        present && void 0 == groupMember.value && ("Coded" == groupMember.concept.dataType ? setDefaultsForCodedObservations(groupMember, defaults) : groupMember.value = defaults[conceptFullName]), groupMember.groupMembers && groupMember.groupMembers.length > 0 && (setDefaultsForGroupMembers(groupMember.groupMembers, defaults), groupMember instanceof Bahmni.ConceptSet.ObservationNode && defaults[groupMember.label] && groupMember.abnormalObs && void 0 == groupMember.abnormalObs.value && groupMember.onValueChanged(groupMember.value))
                    })
                },
                setDefaultsForCodedObservations = function(observation, defaults) {
                    var defaultCodedAnswer = getCodedAnswerWithDefaultAnswerString(defaults, observation);
                    observation.isMultiSelect ? observation.hasValue() || _.each(defaultCodedAnswer, function(answer) {
                        observation.selectAnswer(answer)
                    }) : defaultCodedAnswer instanceof Array || (observation.value = defaultCodedAnswer)
                },
                getFlattenedObsValues = function(flattenedObs) {
                    return _.reduce(flattenedObs, function(flattenedObsValues, obs) {
                        if (void 0 == flattenedObsValues[obs.concept.name + "|" + obs.uniqueId])
                            if (obs.isMultiSelect) {
                                var selectedObsConceptNames = [];
                                _.each(obs.selectedObs, function(observation) {
                                    observation.voided || selectedObsConceptNames.push(observation.value.name), observation.voided || selectedObsConceptNames.push(observation.value.name)
                                }), flattenedObsValues[obs.concept.name + "|" + obs.uniqueId] = selectedObsConceptNames
                            } else if (obs.conceptUIConfig.multiSelect) {
                            var alreadyProcessedMultiSelect = [];
                            _.each(_.keys(flattenedObsValues), function(eachObsKey) {
                                eachObsKey.split("|")[0] == obs.concept.name && alreadyProcessedMultiSelect.push(eachObsKey)
                            }), alreadyProcessedMultiSelect.length < 2 && (flattenedObsValues[obs.concept.name + "|" + obs.uniqueId] = flattenedObsValues[obs.concept.name + "|undefined"])
                        } else obs.value instanceof Object ? flattenedObsValues[obs.concept.name + "|" + obs.uniqueId] = obs.value.name instanceof Object ? obs.value.name.name : obs.value.name : flattenedObsValues[obs.concept.name + "|" + obs.uniqueId] = obs.value;
                        return flattenedObsValues
                    }, {})
                },
                clearFieldValuesOnDisabling = function(obs) {
                    if (obs.comment = void 0, obs.value || obs.isBoolean) obs.value = void 0;
                    else if (obs.isMultiSelect)
                        for (var key in obs.selectedObs) obs.selectedObs[key].voided || obs.toggleSelection(obs.selectedObs[key].value)
                },
                setObservationState = function(obsArray, disable, error, hide) {
                    _.isEmpty(obsArray) || _.each(obsArray, function(obs) {
                        obs.disabled = disable || hide, obs.error = error, obs.hide = hide, (hide || obs.disabled) && clearFieldValuesOnDisabling(obs), obs.groupMembers && _.each(obs.groupMembers, function(groupMember) {
                            groupMember && setObservationState([groupMember], disable, error, hide)
                        })
                    })
                },
                processConditions = function(flattenedObs, fields, disable, error, hide) {
                    _.each(fields, function(field) {
                        var clonedObsInSameGroup, matchingObsArray = [];
                        flattenedObs.forEach(function(obs) {
                            0 != clonedObsInSameGroup && obs.concept.name == field ? (matchingObsArray.push(obs), clonedObsInSameGroup = !0) : clonedObsInSameGroup && obs.concept.name != field && (clonedObsInSameGroup = !1)
                        }), _.isEmpty(matchingObsArray) ? messagingService.showMessage("error", "No element found with name : " + field) : setObservationState(matchingObsArray, disable, error, hide)
                    })
                },
                runFormConditionForObs = function(enableCase, formName, formCondition, conceptName, flattenedObs) {
                    var conceptSetObsValues = getFlattenedObsValues(flattenedObs);
                    _.each(_.keys(conceptSetObsValues), function(eachObsKey) {
                        if (eachObsKey.split("|")[0] == conceptName && "undefined" != eachObsKey.split("|")[1]) {
                            var valueMap = _.reduce(conceptSetObsValues, function(conceptSetValueMap, obsValue, conceptName) {
                                    return conceptSetValueMap[conceptName.split("|")[0]] = obsValue, conceptSetValueMap
                                }, {}),
                                conditions = formCondition(formName, valueMap, $scope.patient);
                            _.isUndefined(conditions) || (conditions.error && !_.isEmpty(conditions.error) ? (messagingService.showMessage("error", conditions.error), processConditions(flattenedObs, [conceptName], !1, !0, !1)) : enableCase && processConditions(flattenedObs, [conceptName], !1, !1, !1), processConditions(flattenedObs, conditions.disable, !0), processConditions(flattenedObs, conditions.enable, !1), processConditions(flattenedObs, conditions.show, !1, void 0, !1), processConditions(flattenedObs, conditions.hide, !1, void 0, !0), _.each(conditions.enable, function(subConditionConceptName) {
                                var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                null != conditionFn && runFormConditionForObs(!0, formName, conditionFn, subConditionConceptName, flattenedObs)
                            }), _.each(conditions.disable, function(subConditionConceptName) {
                                var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                null != conditionFn && _.each(flattenedObs, function(obs) {
                                    obs.concept.name == subConditionConceptName && runFormConditionForObs(!1, formName, conditionFn, subConditionConceptName, flattenedObs)
                                })
                            }), _.each(conditions.show, function(subConditionConceptName) {
                                var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                conditionFn && runFormConditionForObs(!0, formName, conditionFn, subConditionConceptName, flattenedObs)
                            }), _.each(conditions.hide, function(subConditionConceptName) {
                                var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[subConditionConceptName];
                                conditionFn && _.each(flattenedObs, function(obs) {
                                    obs.concept.name == subConditionConceptName && runFormConditionForObs(!1, formName, conditionFn, subConditionConceptName, flattenedObs)
                                })
                            }))
                        }
                    })
                },
                updateFormConditions = function(observationsOfCurrentTemplate, rootObservation) {
                    Bahmni.ConceptSet.FormConditions.rules && runFormConditionForAllObsRecursively(rootObservation.concept.name, rootObservation)
                },
                runFormConditionForAllObsRecursively = function(formName, rootObservation) {
                    _.each(rootObservation.groupMembers, function(observation) {
                        var conditionFn = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[observation.concept.name];
                        if (null != conditionFn) {
                            var flattenedObs = ObservationUtil.flattenObsToArray([rootObservation]);
                            runFormConditionForObs(!1, formName, conditionFn, observation.concept.name, flattenedObs)
                        }
                        observation.groupMembers && observation.groupMembers.length > 0 && runFormConditionForAllObsRecursively(formName, observation)
                    })
                },
                addDummyImage = function() {
                    _.each($scope.rootObservation.groupMembers, function(observation) {
                        addDummyImageObservationForSavedObs(observation, $scope.rootObservation)
                    })
                },
                addDummyImageObservationForSavedObs = function(observation, rootObservation) {
                    if (_.each(observation.groupMembers, function(childObservation) {
                            addDummyImageObservationForSavedObs(childObservation, observation)
                        }), "image" === observation.getControlType() && observation.value && rootObservation.groupMembers.indexOf(observation) === rootObservation.groupMembers.length - 1) return void rootObservation.groupMembers.push(observation.cloneNew())
                },
                init = function() {
                    return conceptSetService.getConcept({
                        name: conceptSetName,
                        v: "bahmni"
                    }).then(function(response) {
                        if ($scope.conceptSet = response.data.results[0], $scope.rootObservation = $scope.conceptSet ? observationMapper.map($scope.observations, $scope.conceptSet, conceptSetUIConfig) : null, $scope.rootObservation) {
                            $scope.rootObservation.conceptSetName = $scope.conceptSetName, focusFirstObs(), updateObservationsOnRootScope();
                            var groupMembers = getObservationsOfCurrentTemplate()[0].groupMembers,
                                defaults = getDefaults();
                            addDummyImage(), setDefaultsForGroupMembers(groupMembers, defaults);
                            var observationsOfCurrentTemplate = getObservationsOfCurrentTemplate();
                            updateFormConditions(observationsOfCurrentTemplate, $scope.rootObservation)
                        } else $scope.showEmptyConceptSetMessage = !0
                    })["catch"](function(error) {
                        messagingService.showMessage("error", error.message)
                    })
                };
            spinner.forPromise(init(), id);
            var validateObservationTree = function() {
                    if ("undefined" == typeof $scope.rootObservation || null === $scope.rootObservation) return {
                        allow: !0,
                        errorMessage: null
                    };
                    $scope.atLeastOneValueIsSet = $scope.rootObservation && $scope.rootObservation.atLeastOneValueSet(), $scope.conceptSetRequired = !$scope.required || $scope.required;
                    var nodes = $scope.rootObservation && findInvalidNodes($scope.rootObservation.groupMembers, $scope.rootObservation);
                    return {
                        allow: !nodes.status,
                        errorMessage: nodes.message
                    }
                },
                findInvalidNodes = function(members, parentNode) {
                    var errorMessage = null,
                        status = members.some(function(childNode) {
                            if (childNode.voided) return !1;
                            var groupMembers = childNode.groupMembers || [];
                            for (var index in groupMembers) {
                                var information = groupMembers[index].groupMembers && groupMembers[index].groupMembers.length ? findInvalidNodes(groupMembers[index].groupMembers, groupMembers[index]) : validateChildNode(groupMembers[index], childNode);
                                if (information.status) return errorMessage = information.message, !0
                            }
                            return information = validateChildNode(childNode, parentNode), information.status ? (errorMessage = information.message, !0) : !childNode.isValid($scope.atLeastOneValueIsSet, $scope.conceptSetRequired)
                        });
                    return {
                        message: errorMessage,
                        status: status
                    }
                },
                validateChildNode = function(childNode, parentNode) {
                    var errorMessage;
                    if (childNode.possibleAnswers && !childNode.possibleAnswers.length) {
                        if ("function" == typeof childNode.isValueInAbsoluteRange && !childNode.isValueInAbsoluteRange()) return errorMessage = "The value you entered (red field) is outside the range of allowable values for that record. Please check the value.", {
                            message: errorMessage,
                            status: !0
                        };
                        if (childNode.isNumeric()) {
                            if (!childNode.isValidNumeric()) return errorMessage = "Please enter Integer value, decimal value is not allowed", {
                                message: errorMessage,
                                status: !0
                            };
                            if (parentNode) {
                                if (!childNode.isValidNumericValue() || !parentNode.isValidNumericValue()) return errorMessage = "Please enter Numeric values", {
                                    message: errorMessage,
                                    status: !0
                                }
                            } else if (!childNode.isValidNumericValue()) return errorMessage = "Please enter Numeric values", {
                                message: errorMessage,
                                status: !0
                            }
                        }
                    }
                    return {
                        status: !1
                    }
                };
            validationHandler.add(validateObservationTree);
            var cleanUpListenerShowPrevious = $scope.$on("event:showPrevious" + conceptSetName, function() {
                    return spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.conceptSetName, null, $scope.numberOfVisits, null, !0), id).then(function(response) {
                        var recentObservations = ObservationUtil.flattenObsToArray(response.data),
                            conceptSetObservation = $scope.observations.filter(function(observation) {
                                return observation.conceptSetName === $scope.conceptSetName
                            });
                        ObservationUtil.flattenObsToArray(conceptSetObservation).forEach(function(obs) {
                            var correspondingRecentObs = _.filter(recentObservations, function(recentObs) {
                                return obs.concept.uuid === recentObs.concept.uuid
                            });
                            null != correspondingRecentObs && correspondingRecentObs.length > 0 && (correspondingRecentObs.sort(function(obs1, obs2) {
                                return new Date(obs2.encounterDateTime) - new Date(obs1.encounterDateTime)
                            }), obs.previous = correspondingRecentObs.map(function(previousObs) {
                                return {
                                    value: Bahmni.Common.Domain.ObservationValueMapper.map(previousObs),
                                    date: previousObs.observationDateTime
                                }
                            }))
                        })
                    })
                }),
                deregisterAddMore = $scope.$root.$on("event:addMore", function(event, observation) {
                    updateFormConditions([observation], observation)
                }),
                deregisterObservationUpdated = $scope.$root.$on("event:observationUpdated-" + conceptSetName, function(event, conceptName, rootObservation) {
                    var formName = rootObservation.concept.name,
                        formCondition = Bahmni.ConceptSet.FormConditions.rules && Bahmni.ConceptSet.FormConditions.rules[conceptName];
                    if (formCondition) {
                        var flattenedObs = ObservationUtil.flattenObsToArray([rootObservation]);
                        runFormConditionForObs(!0, formName, formCondition, conceptName, flattenedObs)
                    }
                });
            $scope.$on("$destroy", function() {
                deregisterObservationUpdated(), deregisterAddMore(), cleanUpListenerShowPrevious()
            })
        };
        return {
            restrict: "E",
            scope: {
                conceptSetName: "=",
                observations: "=?",
                required: "=?",
                showTitle: "&",
                validationHandler: "&",
                patient: "=",
                conceptSetFocused: "=?",
                collapseInnerSections: "=?",
                atLeastOneValueIsSet: "=?",
                sectionId: "="
            },
            templateUrl: "../common/concept-set/views/conceptSet.html",
            controller: controller
        }
    }]), angular.module("bahmni.common.conceptSet").directive("formControls", ["formService", "spinner", "$timeout", "$translate", function(formService, spinner, $timeout, $translate) {
        var loadedFormDetails = {},
            loadedFormTranslations = {},
            unMountReactContainer = function(formUuid) {
                var reactContainerElement = angular.element(document.getElementById(formUuid));
                reactContainerElement.on("$destroy", function() {
                    unMountForm(document.getElementById(formUuid))
                })
            },
            controller = function($scope) {
                var formUuid = $scope.form.formUuid,
                    formVersion = $scope.form.formVersion,
                    formName = $scope.form.formName,
                    formObservations = $scope.form.observations,
                    collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value,
                    validateForm = $scope.validateForm || !1,
                    locale = $translate.use();
                loadedFormDetails[formUuid] ? $timeout(function() {
                    $scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse, $scope.patient, validateForm, locale, loadedFormTranslations[formUuid]), unMountReactContainer($scope.form.formUuid)
                }, 0, !1) : spinner.forPromise(formService.getFormDetail(formUuid, {
                    v: "custom:(resources:(value))"
                }).then(function(response) {
                    var formDetailsAsString = _.get(response, "data.resources[0].value");
                    if (formDetailsAsString) {
                        var formDetails = JSON.parse(formDetailsAsString);
                        formDetails.version = formVersion, loadedFormDetails[formUuid] = formDetails;
                        var formParams = {
                            formName: formName,
                            formVersion: formVersion,
                            locale: locale
                        };
                        spinner.forPromise(formService.getFormTranslations(formDetails.translationsUrl, formParams).then(function(response) {
                            var formTranslations = _.isEmpty(response.data) ? {} : response.data[0];
                            loadedFormTranslations[formUuid] = formTranslations, $scope.form.component = renderWithControls(formDetails, formObservations, formUuid, collapse, $scope.patient, validateForm, locale, formTranslations)
                        }, function() {
                            var formTranslations = {};
                            loadedFormTranslations[formUuid] = formTranslations, $scope.form.component = renderWithControls(formDetails, formObservations, formUuid, collapse, $scope.patient, validateForm, locale, formTranslations)
                        }))
                    }
                    unMountReactContainer($scope.form.formUuid)
                })), $scope.$watch("form.collapseInnerSections", function() {
                    var collapse = $scope.form.collapseInnerSections && $scope.form.collapseInnerSections.value;
                    loadedFormDetails[formUuid] && ($scope.form.component = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse, $scope.patient, validateForm, locale, loadedFormTranslations[formUuid]))
                }), $scope.$on("$destroy", function() {
                    if ($scope.$parent.consultation && $scope.$parent.consultation.observationForms && $scope.form.component) {
                        var formObservations = $scope.form.component.getValue();
                        $scope.form.observations = formObservations.observations;
                        var hasError = formObservations.errors;
                        _.isEmpty(hasError) || ($scope.form.isValid = !1)
                    }
                })
            };
        return {
            restrict: "E",
            scope: {
                form: "=",
                patient: "=",
                validateForm: "="
            },
            controller: controller
        }
    }]), angular.module("bahmni.common.conceptSet").directive("concept", ["RecursionHelper", "spinner", "$filter", "messagingService", "appService", function(RecursionHelper, spinner, $filter, messagingService, appService) {
        var link = function(scope) {
                scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), scope.enableNepaliCalendar = appService.getAppDescriptor().getConfigValue("enableNepaliCalendar");
                var hideAbnormalbuttonConfig = scope.observation && scope.observation.conceptUIConfig && scope.observation.conceptUIConfig.hideAbnormalButton;
                scope.now = moment().format("YYYY-MM-DD hh:mm:ss"), scope.showTitle = void 0 === scope.showTitle || scope.showTitle, scope.hideAbnormalButton = void 0 == hideAbnormalbuttonConfig ? scope.hideAbnormalButton : hideAbnormalbuttonConfig, scope.cloneNew = function(observation, parentObservation) {
                    observation.showAddMoreButton = function() {
                        return !1
                    };
                    var newObs = observation.cloneNew();
                    newObs.scrollToElement = !0;
                    var index = parentObservation.groupMembers.indexOf(observation);
                    parentObservation.groupMembers.splice(index + 1, 0, newObs), messagingService.showMessage("info", "A new " + observation.label + " section has been added"), scope.$root.$broadcast("event:addMore", newObs)
                }, scope.removeClonedObs = function(observation, parentObservation) {
                    observation.voided = !0;
                    var lastObservationByLabel = _.findLast(parentObservation.groupMembers, function(groupMember) {
                        return groupMember.label === observation.label && !groupMember.voided
                    });
                    lastObservationByLabel.showAddMoreButton = function() {
                        return !0
                    }, observation.hidden = !0
                }, scope.isClone = function(observation, parentObservation) {
                    if (parentObservation && parentObservation.groupMembers) {
                        var index = parentObservation.groupMembers.indexOf(observation);
                        return index > 0 && parentObservation.groupMembers[index].label == parentObservation.groupMembers[index - 1].label
                    }
                    return !1
                }, scope.isRemoveValid = function(observation) {
                    return "image" != observation.getControlType() || !observation.value
                }, scope.getStringValue = function(observations) {
                    return observations.map(function(observation) {
                        return observation.value + " (" + $filter("bahmniDate")(observation.date) + ")"
                    }).join(", ")
                }, scope.toggleSection = function() {
                    scope.collapse = !scope.collapse
                }, scope.isCollapsibleSet = function() {
                    return 1 == scope.showTitle
                }, scope.hasPDFAsValue = function() {
                    return scope.observation.value && scope.observation.value.indexOf(".pdf") > 0
                }, scope.$watch("collapseInnerSections", function() {
                    scope.collapse = scope.collapseInnerSections && scope.collapseInnerSections.value
                }), scope.handleUpdate = function() {
                    scope.$root.$broadcast("event:observationUpdated-" + scope.conceptSetName, scope.observation.concept.name, scope.rootObservation)
                }, scope.update = function(value) {
                    scope.getBooleanResult(scope.observation.isObservationNode) ? scope.observation.primaryObs.value = value : scope.getBooleanResult(scope.observation.isFormElement()) && (scope.observation.value = value), scope.handleUpdate()
                }, scope.getBooleanResult = function(value) {
                    return !!value
                }
            },
            compile = function(element) {
                return RecursionHelper.compile(element, link)
            };
        return {
            restrict: "E",
            compile: compile,
            scope: {
                conceptSetName: "=",
                observation: "=",
                atLeastOneValueIsSet: "=",
                showTitle: "=",
                conceptSetRequired: "=",
                rootObservation: "=",
                patient: "=",
                collapseInnerSections: "=",
                rootConcept: "&",
                hideAbnormalButton: "="
            },
            templateUrl: "../common/concept-set/views/observation.html"
        }
    }]), angular.module("bahmni.common.conceptSet").directive("buttonSelect", function() {
        return {
            restrict: "E",
            scope: {
                observation: "=",
                abnormalObs: "=?"
            },
            link: function(scope, element, attrs) {
                attrs.dirtyCheckFlag && (scope.hasDirtyFlag = !0)
            },
            controller: function($scope) {
                $scope.isSet = function(answer) {
                    return $scope.observation.hasValueOf(answer)
                }, $scope.select = function(answer) {
                    $scope.observation.toggleSelection(answer), $scope.$parent.observation && "function" == typeof $scope.$parent.observation.onValueChanged && $scope.$parent.observation.onValueChanged(), $scope.$parent.handleUpdate()
                }, $scope.getAnswerDisplayName = function(answer) {
                    var shortName = answer.names ? _.first(answer.names.filter(function(name) {
                        return "SHORT" === name.conceptNameType
                    })) : null;
                    return shortName ? shortName.name : answer.displayString
                }
            },
            templateUrl: "../common/concept-set/views/buttonSelect.html"
        }
    }), angular.module("bahmni.common.conceptSet").directive("stepper", function() {
        return {
            restrict: "E",
            require: "ngModel",
            replace: !0,
            scope: {
                ngModel: "=",
                obs: "=",
                ngClass: "=",
                focusMe: "="
            },
            template: '<div class="stepper clearfix"><button ng-click="decrement()" class="stepper__btn stepper__minus" ng-disabled="obs.disabled">-</button><input id="{{::obs.uniqueId}}" obs-constraints ng-model="ngModel" obs="::obs" ng-class="ngClass" focus-me="focusMe" type="text" class="stepper__field" ng-disabled="obs.disabled" /><button ng-click="increment()" class="stepper__btn stepper__plus"  ng-disabled="obs.disabled">+</button></div> ',
            link: function(scope, element, attrs, ngModelController) {
                function updateModel(offset) {
                    var currValue = 0;
                    isNaN(ngModelController.$viewValue) ? null != scope.obs.concept.lowNormal && (currValue = scope.obs.concept.lowNormal - offset) : currValue = parseInt(ngModelController.$viewValue), ngModelController.$setViewValue(currValue + offset)
                }
                ngModelController.$render = function() {}, ngModelController.$formatters.push(function(value) {
                    return parseInt(value, 10)
                }), ngModelController.$parsers.push(function(value) {
                    return parseInt(value, 10)
                }), scope.increment = function() {
                    if (null != scope.obs.concept.hiNormal) {
                        var currValue = isNaN(ngModelController.$viewValue) ? 0 : ngModelController.$viewValue;
                        currValue < scope.obs.concept.hiNormal && updateModel(1)
                    } else updateModel(1)
                }, scope.decrement = function() {
                    if (null != scope.obs.concept.lowNormal) {
                        var currValue = isNaN(ngModelController.$viewValue) ? 0 : ngModelController.$viewValue;
                        currValue > scope.obs.concept.lowNormal && updateModel(-1)
                    } else updateModel(-1)
                }
            }
        }
    }), angular.module("bahmni.common.conceptSet").directive("obsConstraints", function() {
        var attributesMap = {
                Numeric: "number",
                Date: "date",
                Datetime: "datetime"
            },
            link = function($scope, element) {
                var attributes = {},
                    obsConcept = $scope.obs.concept;
                obsConcept.conceptClass == Bahmni.Common.Constants.conceptDetailsClassName && (obsConcept = $scope.obs.primaryObs.concept), attributes.type = attributesMap[obsConcept.dataType] || "text", "number" === attributes.type && (attributes.step = "any"), obsConcept.hiNormal && (attributes.max = obsConcept.hiNormal), obsConcept.lowNormal && (attributes.min = obsConcept.lowNormal), "date" == attributes.type && (null != $scope.obs.conceptUIConfig && $scope.obs.conceptUIConfig.allowFutureDates || (attributes.max = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime())), element.attr(attributes)
            };
        return {
            link: link,
            scope: {
                obs: "="
            },
            require: "ngModel"
        }
    }), angular.module("bahmni.common.conceptSet").directive("duration", ["contextChangeHandler", function(contextChangeHandler) {
        var link = function($scope, element, attrs, ngModelController) {
                var setValue = function() {
                    if ($scope.unitValue && $scope.measureValue) {
                        var value = $scope.unitValue * $scope.measureValue;
                        ngModelController.$setViewValue(value)
                    } else ngModelController.$setViewValue(void 0)
                };
                $scope.$watch("measureValue", setValue), $scope.$watch("unitValue", setValue), $scope.$watch("disabled", function(value) {
                    value && ($scope.unitValue = void 0, $scope.measureValue = void 0, $scope.hours = void 0)
                });
                var illegalValueChecker = $scope.$watch("illegalValue", function(value) {
                    $scope.illegalDurationValue = value;
                    var contextChange = function() {
                        return {
                            allow: !$scope.illegalDurationValue
                        }
                    };
                    contextChangeHandler.add(contextChange)
                });
                $scope.$on("$destroy", function() {
                    $scope.illegalDurationValue = !1, illegalValueChecker()
                })
            },
            controller = function($scope) {
                var valueAndUnit = Bahmni.Common.Util.DateUtil.convertToUnits($scope.hours);
                $scope.units = valueAndUnit.allUnits, $scope.measureValue = valueAndUnit.value, $scope.unitValue = valueAndUnit.unitValueInMinutes;
                var durations = Object.keys($scope.units).reverse();
                $scope.displayUnits = durations.map(function(duration) {
                    return {
                        name: duration,
                        value: $scope.units[duration]
                    }
                })
            };
        return {
            restrict: "E",
            require: "ngModel",
            controller: controller,
            scope: {
                hours: "=ngModel",
                illegalValue: "=",
                disabled: "="
            },
            link: link,
            template: '<span><input tabindex="1" style="float: left;" type="number" min="0" class="duration-value" ng-class="{\'illegalValue\': illegalValue}" ng-model=\'measureValue\' ng-disabled="disabled"/></span><span><select tabindex="1" ng-model=\'unitValue\' class="duration-unit" ng-class="{\'illegalValue\': illegalValue}" ng-options="displayUnit.value as displayUnit.name for displayUnit in displayUnits" ng-disabled="disabled"><option value=""></option>></select></span>'
        }
    }]), angular.module("bahmni.common.conceptSet").directive("latestObs", function() {
        var controller = function($scope, observationsService, $q, spinner) {
            var init = function() {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.conceptNames, "latest").then(function(response) {
                    var observations = (new Bahmni.Common.Obs.ObservationMapper).map(response.data, []);
                    $scope.observations = _.sortBy(observations, "sortWeight")
                }))
            };
            init()
        };
        return {
            restrict: "E",
            controller: controller,
            templateUrl: "../common/concept-set/views/latestObs.html",
            scope: {
                patientUuid: "=",
                conceptNames: "="
            }
        }
    }), Bahmni.ConceptSet.ConceptSetGroupValidationHandler = function(conceptSetSections) {
        var validations = [];
        this.add = function(validation) {
            validations.push(validation)
        }, this.validate = function() {
            var errorMessage = "",
                allConceptSetSectionsValid = !0;
            return validations.forEach(function(validation) {
                var validationReturn = validation();
                _.isEmpty(errorMessage) && (errorMessage = validationReturn.errorMessage), allConceptSetSectionsValid = allConceptSetSectionsValid && validationReturn.allow
            }), allConceptSetSectionsValid || conceptSetSections.filter(_.property("isLoaded")).forEach(function(conceptSetSection) {
                conceptSetSection.show()
            }), {
                allow: allConceptSetSectionsValid,
                errorMessage: errorMessage
            }
        }
    }, Bahmni.ConceptSet.Observation = function(observation, savedObs, conceptUIConfig) {
        var self = this;
        angular.extend(this, observation), this.isObservation = !0, this.conceptUIConfig = conceptUIConfig[this.concept.name] || [], this.uniqueId = _.uniqueId("observation_"), this.erroneousValue = null, savedObs ? (this.uuid = savedObs.uuid, this.value = savedObs.value, this.observationDateTime = savedObs.observationDateTime, this.provider = savedObs.provider) : this.value = this.conceptUIConfig.defaultValue, Object.defineProperty(this, "autocompleteValue", {
            enumerable: !0,
            get: function() {
                return null != this.value && "object" == typeof this.value ? this.value.name : this.value
            },
            set: function(newValue) {
                this.__prevValue = this.value, this.value = newValue
            }
        }), Object.defineProperty(this, "value", {
            enumerable: !0,
            get: function() {
                return null != self._value ? self._value : (savedObs && "object" == typeof savedObs.value && savedObs.value && (savedObs.value.displayString = savedObs.value.shortName ? savedObs.value.shortName : savedObs.value.name), savedObs ? savedObs.value : void 0)
            },
            set: function(newValue) {
                self.__prevValue = this.value, self._value = newValue, newValue || (savedObs = null), self.onValueChanged()
            }
        });
        var cloneNonTabularObs = function(oldObs) {
                var newGroupMembers = [];
                return oldObs.groupMembers.forEach(function(member) {
                    if (void 0 === member.isTabularObs) {
                        var clone = member.cloneNew();
                        clone.hidden = member.hidden, newGroupMembers.push(clone)
                    }
                }), newGroupMembers
            },
            getTabularObs = function(oldObs) {
                var tabularObsList = [];
                return oldObs.groupMembers.forEach(function(member) {
                    void 0 !== member.isTabularObs && tabularObsList.push(member)
                }), tabularObsList
            },
            cloneTabularObs = function(oldObs, tabularObsList) {
                return tabularObsList = _.map(tabularObsList, function(tabularObs) {
                    var matchingObsList = _.filter(oldObs.groupMembers, function(member) {
                        return member.concept.name == tabularObs.concept.name
                    });
                    return new Bahmni.ConceptSet.TabularObservations(matchingObsList, oldObs, conceptUIConfig)
                }), tabularObsList.forEach(function(tabularObs) {
                    oldObs.groupMembers.push(tabularObs)
                }), oldObs
            };
        this.cloneNew = function() {
            var oldObs = angular.copy(observation);
            if (oldObs.groupMembers && oldObs.groupMembers.length > 0) {
                oldObs.groupMembers = _.filter(oldObs.groupMembers, function(member) {
                    return !member.isMultiSelect
                });
                var newGroupMembers = cloneNonTabularObs(oldObs),
                    tabularObsList = getTabularObs(oldObs);
                oldObs.groupMembers = newGroupMembers, _.isEmpty(tabularObsList) || (oldObs = cloneTabularObs(oldObs, tabularObsList))
            }
            new Bahmni.ConceptSet.MultiSelectObservations(conceptUIConfig).map(oldObs.groupMembers);
            var clone = new Bahmni.ConceptSet.Observation(oldObs, null, conceptUIConfig);
            return clone.comment = void 0, clone.disabled = this.disabled, clone
        }
    }, Bahmni.ConceptSet.Observation.prototype = {
        displayValue: function() {
            if (!(this.possibleAnswers.length > 0)) return this.value;
            for (var i = 0; i < this.possibleAnswers.length; i++)
                if (this.possibleAnswers[i].uuid === this.value) return this.possibleAnswers[i].display
        },
        isGroup: function() {
            return !!this.groupMembers && this.groupMembers.length > 0
        },
        isComputed: function() {
            return "Computed" === this.concept.conceptClass
        },
        isComputedAndEditable: function() {
            return "Computed/Editable" === this.concept.conceptClass
        },
        isNumeric: function() {
            return "Numeric" === this.getDataTypeName()
        },
        isValidNumeric: function() {
            return !(!this.isDecimalAllowed() && this.value && this.value.toString().indexOf(".") >= 0)
        },
        isValidNumericValue: function() {
            var element = document.getElementById(this.uniqueId);
            return "" !== this.value || !element || element.checkValidity()
        },
        isText: function() {
            return "Text" === this.getDataTypeName()
        },
        isCoded: function() {
            return "Coded" === this.getDataTypeName()
        },
        isDatetime: function() {
            return "Datetime" === this.getDataTypeName()
        },
        isImage: function() {
            return this.concept.conceptClass == Bahmni.Common.Constants.imageClassName
        },
        isVideo: function() {
            return this.concept.conceptClass == Bahmni.Common.Constants.videoClassName
        },
        getDataTypeName: function() {
            return this.concept.dataType
        },
        isDecimalAllowed: function() {
            return this.concept.allowDecimal
        },
        isDateDataType: function() {
            return "Date".indexOf(this.getDataTypeName()) != -1
        },
        isVoided: function() {
            return void 0 !== this.voided && this.voided
        },
        getPossibleAnswers: function() {
            return this.possibleAnswers
        },
        getHighAbsolute: function() {
            return this.concept.hiAbsolute
        },
        getLowAbsolute: function() {
            return this.concept.lowAbsolute
        },
        isHtml5InputDataType: function() {
            return ["Date", "Numeric"].indexOf(this.getDataTypeName()) !== -1
        },
        isGrid: function() {
            return this.conceptUIConfig.grid
        },
        isButtonRadio: function() {
            return this.conceptUIConfig.buttonRadio
        },
        isComplex: function() {
            return "Complex" === this.concept.dataType
        },
        isLocationRef: function() {
            return this.isComplex() && "LocationObsHandler" === this.concept.handler
        },
        isProviderRef: function() {
            return this.isComplex() && "ProviderObsHandler" === this.concept.handler
        },
        getControlType: function() {
            return this.hidden ? "hidden" : this.conceptUIConfig.freeTextAutocomplete ? "freeTextAutocomplete" : this.isHtml5InputDataType() ? "html5InputDataType" : this.isImage() ? "image" : this.isVideo() ? "video" : this.isText() ? "text" : this.isCoded() ? this._getCodedControlType() : this.isGrid() ? "grid" : this.isDatetime() ? "datetime" : this.isLocationRef() ? "text" : this.isProviderRef() ? "text" : "unknown"
        },
        canHaveComment: function() {
            return this.conceptUIConfig.disableAddNotes ? !this.conceptUIConfig.disableAddNotes : !this.isText() && !this.isImage() && !this.isVideo()
        },
        canAddMore: function() {
            return 1 == this.conceptUIConfig.allowAddMore
        },
        isStepperControl: function() {
            if (this.isNumeric()) return 1 == this.conceptUIConfig.stepper
        },
        isConciseText: function() {
            return 1 == this.conceptUIConfig.conciseText
        },
        _getCodedControlType: function() {
            var conceptUIConfig = this.conceptUIConfig;
            return conceptUIConfig.autocomplete ? "autocomplete" : conceptUIConfig.dropdown ? "dropdown" : "buttonselect"
        },
        onValueChanged: function() {
            this.isNumeric() && this.setErroneousValue()
        },
        setErroneousValue: function() {
            if (this.hasValue()) {
                var erroneousValue = this.value > (this.concept.hiAbsolute || 1 / 0) || this.value < (this.concept.lowAbsolute || 0);
                this.erroneousValue = erroneousValue
            } else this.erroneousValue = void 0
        },
        getInputType: function() {
            return this.getDataTypeName()
        },
        atLeastOneValueSet: function() {
            return this.isGroup() ? this.groupMembers.some(function(childNode) {
                return childNode.atLeastOneValueSet()
            }) : this.hasValue() && !this.isVoided()
        },
        hasValue: function() {
            var value = this.value;
            return value === !1 || (0 === value || !("" === value || !value) && (!(value instanceof Array) || value.length > 0))
        },
        hasValueOf: function(value) {
            return !(!this.value || !value) && (this.value == value || this.value.uuid == value.uuid)
        },
        toggleSelection: function(answer) {
            this.value && this.value.uuid === answer.uuid ? this.value = null : this.value = answer
        },
        isValidDate: function() {
            if (this.isComputed()) return !0;
            if (!this.hasValue()) return !0;
            var date = Bahmni.Common.Util.DateUtil.parse(this.value);
            if (!this.conceptUIConfig.allowFutureDates) {
                var today = Bahmni.Common.Util.DateUtil.parse(moment().format("YYYY-MM-DD"));
                if (today < date) return !1
            }
            return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4
        },
        hasInvalidDateTime: function() {
            if (this.isComputed()) return !1;
            var date = Bahmni.Common.Util.DateUtil.parse(this.value);
            return !this.conceptUIConfig.allowFutureDates && moment() < date || "Invalid Datetime" === this.value
        },
        isValid: function(checkRequiredFields, conceptSetRequired) {
            if (this.isNumeric() && !this.isValidNumeric()) return !1;
            if (this.error) return !1;
            if (this.hidden) return !0;
            if (checkRequiredFields) {
                if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
                if (conceptSetRequired && this.isRequired() && !this.hasValue()) return !1;
                if (this.isRequired() && !this.hasValue()) return !1
            }
            return this._isDateDataType() ? this.isValidDate() : this._isDateTimeDataType() ? !this.hasInvalidDateTime() : !this.erroneousValue && ("autocomplete" !== this.getControlType() || (_.isEmpty(this.value) || _.isObject(this.value)))
        },
        isValueInAbsoluteRange: function() {
            return !this.erroneousValue && (!this.isGroup() || this._areChildNodesInAbsoluteRange())
        },
        _isDateDataType: function() {
            return "Date" === this.getDataTypeName()
        },
        _isDateTimeDataType: function() {
            return "Datetime" === this.getDataTypeName()
        },
        isRequired: function() {
            return this.disabled = !!this.disabled && this.disabled, this.conceptUIConfig.required === !0 && this.disabled === !1
        },
        isFormElement: function() {
            return (!this.concept.set || this.isGrid()) && !this.isComputed()
        },
        _hasValidChildren: function(checkRequiredFields, conceptSetRequired) {
            return this.groupMembers.every(function(member) {
                return member.isValid(checkRequiredFields, conceptSetRequired)
            })
        },
        _areChildNodesInAbsoluteRange: function() {
            return this.groupMembers.every(function(member) {
                return "function" != typeof member.isValueInAbsoluteRange || member.isValueInAbsoluteRange()
            })
        },
        markAsNonCoded: function() {
            this.markedAsNonCoded = !this.markedAsNonCoded
        },
        toggleVoidingOfImage: function() {
            this.voided = !this.voided
        },
        assignAddMoreButtonID: function() {
            return this.concept.name.split(" ").join("_").toLowerCase() + "_addmore_" + this.uniqueId
        }
    }, Bahmni.ConceptSet.BooleanObservation = function(observation, conceptUIConfig) {
        angular.extend(this, observation), this.isBoolean = !0, this.conceptUIConfig = conceptUIConfig[this.concept.name] || {}, this.cloneNew = function() {
            var clone = new Bahmni.ConceptSet.BooleanObservation(angular.copy(observation), conceptUIConfig);
            return clone.value = void 0, clone.comment = void 0, clone.uuid = null, clone.disabled = this.disabled, clone
        };
        var possibleAnswers = [{
            displayString: "OBS_BOOLEAN_YES_KEY",
            value: !0
        }, {
            displayString: "OBS_BOOLEAN_NO_KEY",
            value: !1
        }];
        this.getPossibleAnswers = function() {
            return possibleAnswers
        }, this.hasValueOf = function(answer) {
            return this.value === answer.value
        }, this.toggleSelection = function(answer) {
            this.value === answer.value ? this.value = null : this.value = answer.value
        }, this.isFormElement = function() {
            return !0
        }, this.getControlType = function() {
            return "buttonselect"
        }, this.isRequired = function() {
            return this.disabled = !!this.disabled && this.disabled, this.getConceptUIConfig().required === !0 && this.disabled === !1
        }, this.isComputedAndEditable = function() {
            return "Computed/Editable" === this.concept.conceptClass
        }, this.atLeastOneValueSet = function() {
            return void 0 != this.value
        }, this.isValid = function(checkRequiredFields, conceptSetRequired) {
            if (this.error) return !1;
            var notYetSet = function(value) {
                return "undefined" == typeof value || null == value
            };
            if (checkRequiredFields) {
                if (conceptSetRequired && this.isRequired() && notYetSet(this.value)) return !1;
                if (this.isRequired() && notYetSet(this.value)) return !1
            }
            return !0
        }, this.canHaveComment = function() {
            return !this.getConceptUIConfig().disableAddNotes || !this.getConceptUIConfig().disableAddNotes
        }, this.getConceptUIConfig = function() {
            return this.conceptUIConfig
        }, this.canAddMore = function() {
            return 1 == this.getConceptUIConfig().allowAddMore
        }, this.isComputed = function() {
            return "Computed" === this.concept.conceptClass
        }, this.getDataTypeName = function() {
            return this.concept.dataType
        }, this.hasValue = function() {
            var value = this.value;
            return value === !1 || (0 === value || !("" === value || !value) && (!(value instanceof Array) || value.length > 0))
        }, this.isNumeric = function() {
            return "Numeric" === this.getDataTypeName()
        }, this.isText = function() {
            return "Text" === this.getDataTypeName()
        }, this.isCoded = function() {
            return "Coded" === this.getDataTypeName()
        }, this._isDateTimeDataType = function() {
            return "Datetime" === this.getDataTypeName()
        }
    },
    function() {
        var findObservationByClassName = function(groupMembers, conceptClassName) {
                return _.find(groupMembers, function(member) {
                    return member.concept.conceptClass.name === conceptClassName || member.concept.conceptClass === conceptClassName
                })
            },
            findObservationByConceptName = function(groupMembers, conceptName) {
                return _.find(groupMembers, {
                    concept: {
                        name: conceptName
                    }
                })
            },
            setNewObservation = function(observation, newValue) {
                observation && (observation.__prevValue = observation.value, observation.value = newValue, observation.voided = !1)
            },
            voidObservation = function(observation) {
                observation && (observation.uuid ? observation.voided = !0 : observation.value = void 0)
            },
            isFreeTextAutocompleteType = function(conceptUIConfig) {
                return conceptUIConfig.autocomplete && conceptUIConfig.nonCodedConceptName && conceptUIConfig.codedConceptName
            };
        Bahmni.ConceptSet.ObservationNode = function(observation, savedObs, conceptUIConfig, concept) {
            angular.extend(this, observation), this.conceptUIConfig = conceptUIConfig[concept.name.name] || !_.isEmpty(concept.setMembers) && conceptUIConfig[concept.setMembers[0].name.name] || {}, this.cloneNew = function() {
                var oldObs = angular.copy(observation);
                oldObs.groupMembers = _.map(oldObs.groupMembers, function(member) {
                    return member.cloneNew()
                });
                var clone = new Bahmni.ConceptSet.ObservationNode(oldObs, null, conceptUIConfig, concept);
                return clone.comment = void 0, clone
            };
            var getPrimaryObservationValue = function() {
                    return this.primaryObs && _.get(this, "primaryObs.value.name") || _.get(this, "primaryObs.value")
                },
                setFreeTextPrimaryObservationValue = function(newValue) {
                    var codedObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.codedConceptName),
                        nonCodedObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.nonCodedConceptName);
                    "object" == typeof newValue ? (setNewObservation(codedObservation, newValue), voidObservation(nonCodedObservation), this.markedAsNonCoded = !1) : (setNewObservation(nonCodedObservation, newValue), voidObservation(codedObservation)), this.onValueChanged(newValue)
                },
                setFirstObservationValue = function(newValue) {
                    setNewObservation(this.primaryObs, newValue), this.onValueChanged(newValue)
                };
            Object.defineProperty(this, "value", {
                enumerable: !0,
                get: getPrimaryObservationValue,
                set: isFreeTextAutocompleteType(this.conceptUIConfig) ? setFreeTextPrimaryObservationValue : setFirstObservationValue
            });
            var getFreeTextPrimaryObservation = function() {
                    var isAlreadySavedObservation = function(observation) {
                            return _.isString(_.get(observation, "value")) && !_.get(observation, "voided")
                        },
                        codedConceptObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.codedConceptName),
                        nonCodedConceptObservation = findObservationByConceptName(this.groupMembers, this.conceptUIConfig.nonCodedConceptName);
                    if (isAlreadySavedObservation(nonCodedConceptObservation)) return nonCodedConceptObservation;
                    if (!codedConceptObservation) throw new Error("Configuration Error: Concept '" + this.conceptUIConfig.codedConceptName + "' is not a set member of '" + concept.name.name + "'.");
                    return codedConceptObservation
                },
                getGroupMembersWithoutClass = function(groupMembers, classNames) {
                    return _.filter(groupMembers, function(member) {
                        return !(_.includes(classNames, member.concept.conceptClass.name) || _.includes(classNames, member.concept.conceptClass))
                    })
                },
                getFirstObservation = function() {
                    var observations = getGroupMembersWithoutClass(this.groupMembers, [Bahmni.Common.Constants.abnormalConceptClassName, Bahmni.Common.Constants.unknownConceptClassName, Bahmni.Common.Constants.durationConceptClassName]);
                    if (_.isEmpty(observations)) return this.groupMembers[0];
                    var primaryObs = observations[1] && observations[1].uuid && !observations[1].voided ? observations[1] : observations[0];
                    return observations[0].isMultiSelect ? observations[0] : primaryObs.uuid && !primaryObs.voided ? primaryObs : !observations[1] || !observations[1].value && "" !== observations[1].value || observations[1].voided ? observations[0] : observations[1]
                };
            Object.defineProperty(this, "primaryObs", {
                enumerable: !0,
                get: isFreeTextAutocompleteType(this.conceptUIConfig) ? getFreeTextPrimaryObservation : getFirstObservation
            }), this.isObservationNode = !0, this.uniqueId = _.uniqueId("observation_"), this.durationObs = findObservationByClassName(this.groupMembers, Bahmni.Common.Constants.durationConceptClassName), this.abnormalObs = findObservationByClassName(this.groupMembers, Bahmni.Common.Constants.abnormalConceptClassName), this.unknownObs = findObservationByClassName(this.groupMembers, Bahmni.Common.Constants.unknownConceptClassName), this.markedAsNonCoded = "Coded" !== this.primaryObs.concept.dataType && this.primaryObs.uuid, savedObs ? (this.uuid = savedObs.uuid, this.observationDateTime = savedObs.observationDateTime) : this.value = this.conceptUIConfig.defaultValue
        }, Bahmni.ConceptSet.ObservationNode.prototype = {
            canAddMore: function() {
                return 1 == this.conceptUIConfig.allowAddMore
            },
            isStepperControl: function() {
                return !!this.isNumeric() && 1 == this.conceptUIConfig.stepper
            },
            getPossibleAnswers: function() {
                return this.primaryObs.concept.answers
            },
            getCodedConcept: function() {
                return findObservationByConceptName(this.groupMembers, this.conceptUIConfig.codedConceptName).concept
            },
            onValueChanged: function() {
                !this.primaryObs.hasValue() && this.abnormalObs && (this.abnormalObs.value = void 0, this.abnormalObs.erroneousValue = void 0), this.primaryObs.isNumeric() && this.primaryObs.hasValue() && this.abnormalObs && this.setAbnormal(), this.primaryObs.observationDateTime = null, this.unknownObs && this.setUnknown()
            },
            setAbnormal: function() {
                if (this.primaryObs.hasValue()) {
                    var erroneousValue = this.value > (this.primaryObs.concept.hiAbsolute || 1 / 0) || this.value < (this.primaryObs.concept.lowAbsolute || 0),
                        valueInRange = this.value <= (this.primaryObs.concept.hiNormal || 1 / 0) && this.value >= (this.primaryObs.concept.lowNormal || 0);
                    this.abnormalObs.value = !valueInRange, this.abnormalObs.erroneousValue = erroneousValue
                } else this.abnormalObs.value = void 0, this.abnormalObs.erroneousValue = void 0
            },
            setUnknown: function() {
                this.primaryObs.atLeastOneValueSet() && this.primaryObs.hasValue() ? this.unknownObs.value = !1 : 0 == this.unknownObs.value && (this.unknownObs.value = void 0)
            },
            displayValue: function() {
                if (!(this.possibleAnswers.length > 0)) return this.value;
                for (var i = 0; i < this.possibleAnswers.length; i++)
                    if (this.possibleAnswers[i].uuid === this.value) return this.possibleAnswers[i].display
            },
            isGroup: function() {
                return !1
            },
            getControlType: function() {
                return isFreeTextAutocompleteType(this.conceptUIConfig) ? "freeTextAutocomplete" : this.conceptUIConfig.autocomplete ? "autocomplete" : this.isHtml5InputDataType() ? "html5InputDataType" : this.primaryObs.isText() ? "text" : this.conceptUIConfig.dropdown ? "dropdown" : "buttonselect"
            },
            isHtml5InputDataType: function() {
                return ["Date", "Numeric", "Datetime"].indexOf(this.primaryObs.getDataTypeName()) != -1
            },
            _isDateTimeDataType: function() {
                return "Datetime" === this.primaryObs.getDataTypeName()
            },
            isComputed: function() {
                return this.primaryObs.isComputed()
            },
            isConciseText: function() {
                return this.conceptUIConfig.conciseText === !0
            },
            isComputedAndEditable: function() {
                return "Computed/Editable" === this.concept.conceptClass
            },
            atLeastOneValueSet: function() {
                return this.primaryObs.hasValue()
            },
            doesNotHaveDuration: function() {
                return !(!this.durationObs || !this.conceptUIConfig.durationRequired) && (!this.durationObs.value || this.durationObs.value < 0)
            },
            isValid: function(checkRequiredFields, conceptSetRequired) {
                if (this.isNumeric() && (!this.isValidNumeric() || !this.isValidNumericValue())) return !1;
                if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
                if (checkRequiredFields) {
                    if (conceptSetRequired && this.isRequired() && !this.primaryObs.hasValue()) return !1;
                    if (this.isRequired() && !this.primaryObs.hasValue()) return !1;
                    if ("freeTextAutocomplete" === this.getControlType()) return this.isValidFreeTextAutocomplete()
                }
                return "Date" === this.primaryObs.getDataTypeName() ? this.primaryObs.isValidDate() : (!this.primaryObs.hasValue() || !this.doesNotHaveDuration()) && ((!this.abnormalObs || !this.abnormalObs.erroneousValue) && (this.primaryObs.hasValue() && this.primaryObs._isDateTimeDataType() ? !this.hasInvalidDateTime() : "autocomplete" === this.getControlType() ? _.isEmpty(this.primaryObs.value) || _.isObject(this.primaryObs.value) : !this.primaryObs.hasValue() || !this.primaryObs.erroneousValue))
            },
            isValueInAbsoluteRange: function() {
                return !(this.abnormalObs && this.abnormalObs.erroneousValue)
            },
            isValidFreeTextAutocomplete: function() {
                return !("Coded" !== this.primaryObs.concept.dataType && !this.markedAsNonCoded && this.primaryObs.value)
            },
            isRequired: function() {
                return this.disabled = !!this.disabled && this.disabled, this.conceptUIConfig.required === !0 && this.disabled === !1
            },
            isDurationRequired: function() {
                return !!this.conceptUIConfig.durationRequired && !!this.primaryObs.value
            },
            isNumeric: function() {
                return "Numeric" === this.primaryObs.getDataTypeName()
            },
            isDecimalAllowed: function() {
                return this.primaryObs.concept.allowDecimal
            },
            isValidNumeric: function() {
                return !(!this.isDecimalAllowed() && this.value && this.value.toString().indexOf(".") >= 0)
            },
            isValidNumericValue: function() {
                var element = document.getElementById(this.uniqueId);
                return "" !== this.value || !element || element.checkValidity()
            },
            _hasValidChildren: function(checkRequiredFields, conceptSetRequired) {
                return this.groupMembers.every(function(member) {
                    return member.isValid(checkRequiredFields, conceptSetRequired)
                })
            },
            markAsNonCoded: function() {
                this.markedAsNonCoded = !this.markedAsNonCoded
            },
            toggleAbnormal: function() {
                this.abnormalObs.value = !this.abnormalObs.value
            },
            toggleUnknown: function() {
                this.unknownObs.value ? this.unknownObs.value = void 0 : this.unknownObs.value = !0
            },
            assignAddMoreButtonID: function() {
                return this.concept.name.split(" ").join("_").toLowerCase() + "_addmore_" + this.uniqueId
            },
            canHaveComment: function() {
                return !this.conceptUIConfig.disableAddNotes || !this.conceptUIConfig.disableAddNotes
            },
            hasInvalidDateTime: function() {
                if (this.isComputed()) return !1;
                var date = Bahmni.Common.Util.DateUtil.parse(this.value);
                return !this.conceptUIConfig.allowFutureDates && moment() < date || "Invalid Datetime" === this.value
            }
        }
    }(), Bahmni.ConceptSet.TabularObservations = function(obsGroups, parentObs, conceptUIConfig) {
        this.parentObs = parentObs, this.concept = obsGroups[0] && obsGroups[0].concept, this.label = obsGroups[0] && obsGroups[0].label, this.conceptUIConfig = conceptUIConfig[this.concept.name] || {}, this.isTabularObs = !0, this.rows = _.map(obsGroups, function(group) {
            return new Bahmni.ConceptSet.ObservationRow(group, conceptUIConfig)
        }), this.columns = _.map(obsGroups[0].groupMembers, function(group) {
            return group.concept
        }), this.cloneNew = function() {
            var old = this,
                clone = new Bahmni.ConceptSet.TabularObservations(angular.copy(obsGroups), parentObs, conceptUIConfig);
            return clone.rows = _.map(old.rows, function(row) {
                return row.cloneNew()
            }), clone.disabled = this.disabled, clone
        }, this.addNew = function(row) {
            var newRow = row.cloneNew();
            this.rows.push(newRow), this.parentObs.groupMembers.push(newRow.obsGroup)
        }, this.remove = function(row) {
            row["void"](), this.rows.splice(this.rows.indexOf(row), 1), 0 == this.rows.length && this.addNew(row)
        }, this.isFormElement = function() {
            return !1
        }, this.getControlType = function() {
            return "tabular"
        }, this.isValid = function(checkRequiredFields, conceptSetRequired) {
            return _.every(this.rows, function(observationRow) {
                return _.every(observationRow.cells, function(conceptSetObservation) {
                    return conceptSetObservation.isValid(checkRequiredFields, conceptSetRequired)
                })
            })
        }, this.getConceptUIConfig = function() {
            return this.conceptUIConfig || {}
        }, this.canAddMore = function() {
            return 1 == this.getConceptUIConfig().allowAddMore
        }, this.atLeastOneValueSet = function() {
            return this.rows.some(function(childNode) {
                return childNode.obsGroup.atLeastOneValueSet()
            })
        }, this.isNumeric = function() {
            return "Numeric" === this.concept.dataType
        }, this.isValidNumericValue = function() {
            var element = document.getElementById(this.uniqueId);
            return "" !== this.value || !element || element.checkValidity()
        }
    }, Bahmni.ConceptSet.ObservationRow = function(obsGroup, conceptUIConfig) {
        this.obsGroup = obsGroup, this.concept = obsGroup.concept, this.cells = obsGroup.groupMembers, this["void"] = function() {
            this.obsGroup.voided = !0
        }, this.cloneNew = function() {
            var newObsGroup = this.obsGroup.cloneNew();
            newObsGroup.hidden = !0;
            var clone = new Bahmni.ConceptSet.ObservationRow(newObsGroup, conceptUIConfig);
            return clone.disabled = this.disabled, clone
        }
    }, Bahmni.ConceptSet.MultiSelectObservations = function(conceptSetConfig) {
        var self = this;
        this.multiSelectObservationsMap = {}, this.map = function(memberOfCollection) {
            memberOfCollection.forEach(function(member) {
                isMultiSelectable(member.concept, conceptSetConfig) && add(member.concept, member, memberOfCollection)
            }), insertMultiSelectObsInExistingOrder(memberOfCollection)
        };
        var isMultiSelectable = function(concept, conceptSetConfig) {
                return conceptSetConfig[concept.name] && conceptSetConfig[concept.name].multiSelect
            },
            insertMultiSelectObsInExistingOrder = function(memberOfCollection) {
                getAll().forEach(function(multiObs) {
                    var index = _.findIndex(memberOfCollection, function(member) {
                        return member.concept.name === multiObs.concept.name
                    });
                    memberOfCollection.splice(index, 0, multiObs)
                })
            },
            add = function(concept, obs, memberOfCollection) {
                var conceptName = concept.name.name || concept.name;
                self.multiSelectObservationsMap[conceptName] = self.multiSelectObservationsMap[conceptName] || new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig), self.multiSelectObservationsMap[conceptName].add(obs)
            },
            getAll = function() {
                return _.values(self.multiSelectObservationsMap)
            }
    }, Bahmni.ConceptSet.MultiSelectObservation = function(concept, memberOfCollection, conceptSetConfig) {
        var self = this;
        this.label = concept.shortName || concept.name, this.isMultiSelect = !0, this.selectedObs = {}, this.concept = concept, this.concept.answers = this.concept.answers || [], this.groupMembers = [], this.provider = null, this.observationDateTime = "", this.conceptUIConfig = conceptSetConfig[this.concept.name] || {}, this.possibleAnswers = self.concept.answers.map(function(answer) {
            var cloned = _.cloneDeep(answer);
            return answer.name.name && (cloned.name = answer.name.name), cloned
        }), this.getPossibleAnswers = function() {
            return this.possibleAnswers
        }, this.cloneNew = function() {
            var clone = new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig);
            return clone.disabled = this.disabled, clone
        }, this.add = function(obs) {
            if (obs.value) {
                self.selectedObs[obs.value.name] = obs, self.provider || (self.provider = self.selectedObs[obs.value.name].provider);
                var currentObservationDateTime = self.selectedObs[obs.value.name].observationDateTime;
                self.observationDateTime < currentObservationDateTime && (self.observationDateTime = currentObservationDateTime)
            }
            obs.hidden = !0
        }, this.isComputedAndEditable = function() {
            return "Computed/Editable" === this.concept.conceptClass
        }, this.hasValueOf = function(answer) {
            return self.selectedObs[answer.name] && !self.selectedObs[answer.name].voided
        }, this.toggleSelection = function(answer) {
            self.hasValueOf(answer) ? unselectAnswer(answer) : self.selectAnswer(answer)
        }, this.isFormElement = function() {
            return !0
        }, this.getControlType = function() {
            var conceptConfig = this.getConceptUIConfig();
            return this.isCoded() && 1 == conceptConfig.autocomplete && 1 == conceptConfig.multiSelect ? "autocompleteMultiSelect" : 1 == conceptConfig.autocomplete ? "autocomplete" : "buttonselect"
        }, this.atLeastOneValueSet = function() {
            var obsValue = _.filter(this.selectedObs, function(obs) {
                return obs.value
            });
            return !_.isEmpty(obsValue)
        }, this.hasValue = function() {
            return !_.isEmpty(this.selectedObs)
        }, this.hasNonVoidedValue = function() {
            var hasNonVoidedValue = !1;
            return this.hasValue() && angular.forEach(this.selectedObs, function(obs) {
                obs.voided || (hasNonVoidedValue = !0)
            }), hasNonVoidedValue
        }, this.isValid = function(checkRequiredFields, conceptSetRequired) {
            if (this.error) return !1;
            if (checkRequiredFields) {
                if (conceptSetRequired && this.isRequired() && !this.hasNonVoidedValue()) return !1;
                if (this.isRequired() && !this.hasNonVoidedValue()) return !1
            }
            return !0
        }, this.canHaveComment = function() {
            return !1
        }, this.getConceptUIConfig = function() {
            return this.conceptUIConfig || {}
        }, this.canAddMore = function() {
            return 1 == this.getConceptUIConfig().allowAddMore
        }, this.isRequired = function() {
            return this.disabled = !!this.disabled && this.disabled, this.getConceptUIConfig().required === !0 && this.disabled === !1
        };
        var createObsFrom = function(answer) {
                var obs = newObservation(concept, answer, conceptSetConfig);
                return memberOfCollection.push(obs), obs
            },
            removeObsFrom = function(answer) {
                var obs = newObservation(concept, answer, conceptSetConfig);
                _.remove(memberOfCollection, function(member) {
                    return !!member.value && obs.value.displayString == member.value.displayString
                })
            };
        this.selectAnswer = function(answer) {
            var obs = self.selectedObs[answer.name];
            obs ? (obs.value = answer, obs.voided = !1) : (obs = createObsFrom(answer), self.add(obs))
        };
        var unselectAnswer = function(answer) {
                var obs = self.selectedObs[answer.name];
                obs && obs.uuid ? (obs.value = null, obs.voided = !0) : (removeObsFrom(answer), delete self.selectedObs[answer.name])
            },
            newObservation = function(concept, value, conceptSetConfig) {
                var observation = buildObservation(concept);
                return new Bahmni.ConceptSet.Observation(observation, {
                    value: value
                }, conceptSetConfig, [])
            },
            buildObservation = function(concept) {
                return {
                    concept: concept,
                    units: concept.units,
                    label: concept.shortName || concept.name,
                    possibleAnswers: self.concept.answers,
                    groupMembers: [],
                    comment: null
                }
            };
        this.getValues = function() {
            var values = [];
            return _.values(self.selectedObs).forEach(function(obs) {
                obs.value && values.push(obs.value.shortName || obs.value.name)
            }), values
        }, this.isComputed = function() {
            return "Computed" === this.concept.conceptClass
        }, this.getDataTypeName = function() {
            return this.concept.dataType
        }, this._isDateTimeDataType = function() {
            return "Datetime" === this.getDataTypeName()
        }, this.isNumeric = function() {
            return "Numeric" === this.getDataTypeName()
        }, this.isText = function() {
            return "Text" === this.getDataTypeName()
        }, this.isCoded = function() {
            return "Coded" === this.getDataTypeName()
        }
    }, Bahmni.ConceptSet.CustomRepresentationBuilder = {
        build: function(fields, childPropertyName, numberOfLevels) {
            for (var childPropertyRep = childPropertyName + ":{{entity_fileds}}", singleEntityString = "(" + fields.concat(childPropertyRep).join(",") + ")", customRepresentation = singleEntityString, i = 0; i < numberOfLevels; i++) customRepresentation = customRepresentation.replace("{{entity_fileds}}", singleEntityString);
            return customRepresentation = customRepresentation.replace("," + childPropertyRep, "")
        }
    }, Bahmni.ConceptSet.ConceptSetSection = function(extensions, user, config, observations, conceptSet) {
        var self = this;
        self.clone = function() {
            var clonedConceptSetSection = new Bahmni.ConceptSet.ConceptSetSection(extensions, user, config, [], conceptSet);
            return clonedConceptSetSection.isAdded = !0, clonedConceptSetSection
        };
        var init = function() {
                self.observations = observations, self.options = extensions.extensionParams || {}, self.conceptName = conceptSet.name ? conceptSet.name.name : self.options.conceptName;
                var conceptName = _.find(conceptSet.names, {
                    conceptNameType: "SHORT"
                }) || _.find(conceptSet.names, {
                    conceptNameType: "FULLY_SPECIFIED"
                });
                conceptName = conceptName ? conceptName.name : conceptName, self.label = conceptName || self.conceptName || self.options.conceptName, self.isLoaded = self.isOpen, self.collapseInnerSections = {
                    value: !1
                }, self.uuid = conceptSet.uuid, self.alwaysShow = user.isFavouriteObsTemplate(self.conceptName), self.allowAddMore = config.allowAddMore, self.id = "concept-set-" + conceptSet.uuid
            },
            getShowIfFunction = function() {
                if (!self.showIfFunction) {
                    var showIfFunctionStrings = self.options.showIf || ["return true;"];
                    self.showIfFunction = new Function("context", showIfFunctionStrings.join("\n"))
                }
                return self.showIfFunction
            },
            atLeastOneValueSet = function(observation) {
                return observation.groupMembers && observation.groupMembers.length > 0 ? observation.groupMembers.some(function(groupMember) {
                    return atLeastOneValueSet(groupMember)
                }) : !(_.isUndefined(observation.value) || "" === observation.value)
            };
        self.isAvailable = function(context) {
            return getShowIfFunction()(context || {})
        }, self.show = function() {
            self.isOpen = !0, self.isLoaded = !0
        }, self.hide = function() {
            self.isOpen = !1
        }, self.getObservationsForConceptSection = function() {
            return self.observations.filter(function(observation) {
                return observation.concept.name === self.conceptName
            })
        }, self.hasSomeValue = function() {
            var observations = self.getObservationsForConceptSection();
            return _.some(observations, function(observation) {
                return atLeastOneValueSet(observation)
            })
        }, self.showComputeButton = function() {
            return config.computeDrugs === !0
        }, self.toggle = function() {
            self.added = !self.added, self.added && self.show()
        }, self.maximizeInnerSections = function(event) {
            event.stopPropagation(), self.collapseInnerSections = {
                value: !1
            }
        }, self.minimizeInnerSections = function(event) {
            event.stopPropagation(), self.collapseInnerSections = {
                value: !0
            }
        }, self.toggleDisplay = function() {
            self.isOpen ? self.hide() : self.show()
        }, self.canToggle = function() {
            return !self.hasSomeValue()
        }, self.canAddMore = function() {
            return 1 == self.allowAddMore
        }, Object.defineProperty(self, "isOpen", {
            get: function() {
                return void 0 === self.open && (self.open = self.hasSomeValue()), self.open
            },
            set: function(value) {
                self.open = value
            }
        }), self.isDefault = function() {
            return self.options["default"]
        }, Object.defineProperty(self, "isAdded", {
            get: function() {
                return void 0 === self.added && (self.options["default"] ? self.added = !0 : self.added = self.hasSomeValue()), self.added
            },
            set: function(value) {
                self.added = value
            }
        }), init()
    }, Bahmni.ObservationForm = function(formUuid, user, formName, formVersion, observations, extension) {
        function hide() {
            self.isOpen = !1
        }

        function show() {
            self.isOpen = !0
        }
        var self = this,
            init = function() {
                self.formUuid = formUuid, self.formVersion = formVersion, self.formName = formName, self.label = formName, self.conceptName = formName, self.collapseInnerSections = {
                    value: !1
                }, self.alwaysShow = user.isFavouriteObsTemplate(self.conceptName), self.observations = [], _.each(observations, function(observation) {
                    var observationFormField = observation.formFieldPath ? observation.formFieldPath.split("/")[0].split(".") : null;
                    observationFormField && observationFormField[0] === formName && observationFormField[1] === formVersion && self.observations.push(observation)
                }), self.isOpen = self.observations.length > 0, self.id = "concept-set-" + formUuid, self.options = extension ? extension.extensionParams || {} : {}
            };
        self.toggleDisplay = function() {
            self.isOpen ? hide() : show()
        }, self.clone = function() {
            var clonedObservationFormSection = new Bahmni.ObservationForm(self.formUuid, user, self.formName, self.formVersion, []);
            return clonedObservationFormSection.isOpen = !0, clonedObservationFormSection
        }, self.isAvailable = function(context) {
            return !0
        }, self.show = function() {
            self.isOpen = !0, self.isLoaded = !0
        }, self.toggle = function() {
            self.added = !self.added, self.added && self.show()
        }, self.hasSomeValue = function() {
            var observations = self.getObservationsForConceptSection();
            return _.some(observations, function(observation) {
                return atLeastOneValueSet(observation)
            })
        }, self.getObservationsForConceptSection = function() {
            return self.observations.filter(function(observation) {
                return observation.formFieldPath.split(".")[0] === self.formName
            })
        };
        var atLeastOneValueSet = function(observation) {
            return observation.groupMembers && observation.groupMembers.length > 0 ? observation.groupMembers.some(function(groupMember) {
                return atLeastOneValueSet(groupMember)
            }) : !(_.isUndefined(observation.value) || "" === observation.value)
        };
        self.isDefault = function() {
            return !1
        }, Object.defineProperty(self, "isAdded", {
            get: function() {
                return self.hasSomeValue() && (self.added = !0), self.added
            },
            set: function(value) {
                self.added = value
            }
        }), self.maximizeInnerSections = function(event) {
            event.stopPropagation(), self.collapseInnerSections = {
                value: !1
            }
        }, self.minimizeInnerSections = function(event) {
            event.stopPropagation(), self.collapseInnerSections = {
                value: !0
            }
        }, init()
    }, Bahmni.ConceptSet.ObservationMapper = function() {
        function mapTabularObs(mappedGroupMembers, concept, obs, conceptSetConfig) {
            var tabularObsGroups = _.filter(mappedGroupMembers, function(member) {
                return conceptSetConfig[member.concept.name] && conceptSetConfig[member.concept.name].isTabular
            });
            if (tabularObsGroups.length > 0) {
                var array = _.map(concept.setMembers, function(member) {
                    return member.name.name
                });
                tabularObsGroups.forEach(function(group) {
                    group.hidden = !0
                });
                var groupedObsGroups = _.groupBy(tabularObsGroups, function(group) {
                    return group.concept.name
                });
                _.values(groupedObsGroups).forEach(function(groups) {
                    var tabularObservations = new Bahmni.ConceptSet.TabularObservations(groups, obs, conceptSetConfig);
                    obs.groupMembers.push(tabularObservations)
                });
                var sortedGroupMembers = _.sortBy(obs.groupMembers, function(observation) {
                    return array.indexOf(observation.concept.name)
                });
                obs.groupMembers.length = 0, obs.groupMembers.push.apply(obs.groupMembers, sortedGroupMembers)
            }
        }

        function buildObservation(concept, savedObs, mappedGroupMembers) {
            var comment = savedObs ? savedObs.comment : null;
            return {
                concept: conceptMapper.map(concept),
                units: concept.units,
                label: getLabel(concept),
                possibleAnswers: concept.answers,
                groupMembers: mappedGroupMembers,
                comment: comment,
                showAddMoreButton: showAddMoreButton
            }
        }
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper,
            self = this;
        this.getObservationsForView = function(observations, conceptSetConfig) {
            return internalMapForDisplay(observations, conceptSetConfig)
        };
        var internalMapForDisplay = function(observations, conceptSetConfig) {
            var observationsForDisplay = [];
            return _.forEach(observations, function(savedObs) {
                if (!savedObs.concept.conceptClass || savedObs.concept.conceptClass !== Bahmni.Common.Constants.conceptDetailsClassName && savedObs.concept.conceptClass.name !== Bahmni.Common.Constants.conceptDetailsClassName)
                    if (savedObs.concept.set)
                        if (conceptSetConfig[savedObs.concept.name] && conceptSetConfig[savedObs.concept.name].grid) savedObs.value = self.getGridObservationDisplayValue(savedObs), observationsForDisplay = observationsForDisplay.concat(createObservationForDisplay(savedObs, savedObs.concept));
                        else {
                            var groupMemberObservationsForDisplay = internalMapForDisplay(savedObs.groupMembers, conceptSetConfig);
                            observationsForDisplay = observationsForDisplay.concat(groupMemberObservationsForDisplay)
                        }
                else {
                    var obsToDisplay = null;
                    if (savedObs.isMultiSelect) obsToDisplay = savedObs;
                    else if (!savedObs.hidden) {
                        var observation = newObservation(savedObs.concept, savedObs, []);
                        obsToDisplay = createObservationForDisplay(observation, observation.concept)
                    }
                    obsToDisplay && observationsForDisplay.push(obsToDisplay)
                } else {
                    var observationNode = new Bahmni.ConceptSet.ObservationNode(savedObs, savedObs, [], savedObs.concept),
                        obsToDisplay = createObservationForDisplay(observationNode, observationNode.primaryObs.concept);
                    obsToDisplay && observationsForDisplay.push(obsToDisplay)
                }
            }), observationsForDisplay
        };
        this.map = function(observations, rootConcept, conceptSetConfig) {
            var savedObs = findInSavedObservation(rootConcept, observations)[0];
            return mapObservation(rootConcept, savedObs, conceptSetConfig || {})
        };
        var findInSavedObservation = function(concept, observations) {
                return _.filter(observations, function(obs) {
                    return obs && obs.concept && concept.uuid === obs.concept.uuid
                })
            },
            mapObservation = function(concept, savedObs, conceptSetConfig) {
                var obs = null;
                if (savedObs && (savedObs.isObservation || savedObs.isObservationNode)) return savedObs;
                var mappedGroupMembers = concept && concept.set ? mapObservationGroupMembers(savedObs ? savedObs.groupMembers : [], concept, conceptSetConfig) : [];
                return concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName ? obs = newObservationNode(concept, savedObs, conceptSetConfig, mappedGroupMembers) : (obs = newObservation(concept, savedObs, conceptSetConfig, mappedGroupMembers), new Bahmni.ConceptSet.MultiSelectObservations(conceptSetConfig).map(mappedGroupMembers)), mapTabularObs(mappedGroupMembers, concept, obs, conceptSetConfig), obs
            },
            mapObservationGroupMembers = function(observations, parentConcept, conceptSetConfig) {
                var observationGroupMembers = [],
                    conceptSetMembers = parentConcept.setMembers;
                return conceptSetMembers.forEach(function(memberConcept) {
                    for (var savedObservations = findInSavedObservation(memberConcept, observations), configForConcept = conceptSetConfig[memberConcept.name.name] || {}, numberOfNodes = configForConcept.multiple || 1, i = savedObservations.length - 1; i >= 0; i--) observationGroupMembers.push(mapObservation(memberConcept, savedObservations[i], conceptSetConfig));
                    for (var i = 0; i < numberOfNodes - savedObservations.length; i++) observationGroupMembers.push(mapObservation(memberConcept, null, conceptSetConfig))
                }), observationGroupMembers
            },
            getDatatype = function(concept) {
                return concept.dataType ? concept.dataType : concept.datatype && concept.datatype.name
            },
            newObservation = function(concept, savedObs, conceptSetConfig, mappedGroupMembers) {
                var observation = buildObservation(concept, savedObs, mappedGroupMembers),
                    obs = new Bahmni.ConceptSet.Observation(observation, savedObs, conceptSetConfig, mappedGroupMembers);
                return "Boolean" == getDatatype(concept) && (obs = new Bahmni.ConceptSet.BooleanObservation(obs, conceptSetConfig)), obs
            },
            newObservationNode = function(concept, savedObsNode, conceptSetConfig, mappedGroupMembers) {
                var observation = buildObservation(concept, savedObsNode, mappedGroupMembers);
                return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig, concept)
            },
            showAddMoreButton = function(rootObservation) {
                var observation = this,
                    lastObservationByLabel = _.findLast(rootObservation.groupMembers, {
                        label: observation.label
                    });
                return lastObservationByLabel.uuid === observation.uuid
            },
            createObservationForDisplay = function(observation, concept) {
                if (null != observation.value) {
                    var observationValue = getObservationDisplayValue(observation);
                    return observationValue = observation.durationObs ? observationValue + " " + getDurationDisplayValue(observation.durationObs) : observationValue, {
                        value: observationValue,
                        abnormalObs: observation.abnormalObs,
                        duration: observation.durationObs,
                        provider: observation.provider,
                        label: getLabel(observation.concept),
                        observationDateTime: observation.observationDateTime,
                        concept: concept,
                        comment: observation.comment,
                        uuid: observation.uuid
                    }
                }
            },
            getObservationDisplayValue = function(observation) {
                if (observation.isBoolean || "Boolean" === observation.type) return observation.value === !0 ? "Yes" : "No";
                if (!observation.value) return "";
                if ("object" == typeof observation.value.name) {
                    var valueConcept = conceptMapper.map(observation.value);
                    return valueConcept.shortName || valueConcept.name
                }
                return observation.value.shortName || observation.value.name || observation.value
            },
            getDurationDisplayValue = function(duration) {
                var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(duration.value);
                return durationForDisplay.value && durationForDisplay.unitName ? "since " + durationForDisplay.value + " " + durationForDisplay.unitName : ""
            };
        this.getGridObservationDisplayValue = function(observation) {
            var memberValues = _.compact(_.map(observation.groupMembers, function(member) {
                return getObservationDisplayValue(member)
            }));
            return memberValues.join(", ")
        };
        var getLabel = function(concept) {
            var mappedConcept = conceptMapper.map(concept);
            return mappedConcept.shortName || mappedConcept.name
        }
    }, angular.module("bahmni.common.conceptSet").factory("conceptService", ["$q", "$http", function($q, $http) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper,
            mapConceptOrGetDrug = function(conceptAnswer) {
                return conceptAnswer.concept && conceptMapper.map(conceptAnswer.concept) || conceptAnswer.drug
            },
            getAnswersForConceptName = function(request) {
                var params = {
                    q: request.term,
                    question: request.answersConceptName,
                    v: "custom:(concept:(uuid,name:(display,uuid,name,conceptNameType),names:(display,uuid,name,conceptNameType)),drug:(uuid,name,display))",
                    s: "byQuestion"
                };
                return $http.get(Bahmni.Common.Constants.bahmniConceptAnswerUrl, {
                    params: params
                }).then(_.partial(_.get, _, "data.results")).then(function(conceptAnswers) {
                    return _(conceptAnswers).map(mapConceptOrGetDrug).uniqBy("uuid").value()
                })
            },
            getAnswers = function(defaultConcept) {
                var deferred = $q.defer(),
                    response = _(defaultConcept.answers).uniqBy("uuid").map(conceptMapper.map).value();
                return deferred.resolve(response), deferred.promise
            };
        return {
            getAnswersForConceptName: getAnswersForConceptName,
            getAnswers: getAnswers
        }
    }]), angular.module("bahmni.common.conceptSet").factory("conceptSetUiConfigService", ["$http", "$q", "appService", function($http, $q, appService) {
        var setConceptUuidInsteadOfName = function(config, conceptNameField, uuidField) {
                var conceptName = config[conceptNameField];
                if (null != conceptName) return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                    params: {
                        name: conceptName,
                        v: "custom:(uuid,name)"
                    }
                }).then(function(response) {
                    var concept = response.data.results.filter(function(c) {
                        return c.name.name === conceptName
                    });
                    concept.length > 0 && (config[uuidField] = concept[0].uuid)
                })
            },
            setExtraData = function(config) {
                Object.getOwnPropertyNames(config).forEach(function(conceptConfigKey) {
                    var conceptConfig = config[conceptConfigKey];
                    conceptConfig.freeTextAutocomplete instanceof Object && (setConceptUuidInsteadOfName(conceptConfig.freeTextAutocomplete, "codedConceptName", "codedConceptUuid"), setConceptUuidInsteadOfName(conceptConfig.freeTextAutocomplete, "conceptSetName", "conceptSetUuid"))
                })
            },
            getConfig = function() {
                var config = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                return setExtraData(config), config
            };
        return {
            getConfig: getConfig
        }
    }]), angular.module("bahmni.common.uiHelper").filter("thumbnail", function() {
        return function(url, extension) {
            if (url) return extension ? Bahmni.Common.Constants.documentsPath + "/" + url.replace(/(.*)\.(.*)$/, "$1_thumbnail." + extension) || null : Bahmni.Common.Constants.documentsPath + "/" + url.replace(/(.*)\.(.*)$/, "$1_thumbnail.$2") || null
        }
    }), angular.module("bahmni.common.uiHelper").filter("days", function() {
        return function(startDate, endDate) {
            return Bahmni.Common.Util.DateUtil.diffInDays(startDate, endDate)
        }
    }).filter("bahmniDateTime", function() {
        return function(date) {
            return Bahmni.Common.Util.DateUtil.formatDateWithTime(date)
        }
    }).filter("bahmniDate", function() {
        return function(date) {
            return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(date)
        }
    }).filter("bahmniTime", function() {
        return function(date) {
            return Bahmni.Common.Util.DateUtil.formatTime(date)
        }
    }).filter("bahmniDateInStrictMode", function() {
        return function(date) {
            return Bahmni.Common.Util.DateUtil.formatDateInStrictMode(date)
        }
    })
//    .filter("npDate", function() {
//        return function(date) {
//            if (null !== date && void 0 !== date && "" !== date && Bahmni.Common.Util.DateUtil.isValid(date)) {
//                date = isNaN(Number(date)) ? date : Number(date);
//                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(date).split("-"),
//                    bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
//                return calendarFunctions.bsDateFormat("%y %M, %d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate)
//            }
//            return date
//        }
//    })
//    .filter("npDateTime", function() {
//        return function(date) {
//            if (null !== date && void 0 !== date && "" !== date && Bahmni.Common.Util.DateUtil.isValid(date)) {
//                date = isNaN(Number(date)) ? date : Number(date);
//                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(date).split("-"),
//                    bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
//                return calendarFunctions.bsDateFormat("%y %M, %d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate) + " " + Bahmni.Common.Util.DateUtil.formatTime(date)
//            }
//            return date
//        }
//    });

        .filter("npDate", function() {
        return function(date) {
            if (date != null && date !== undefined && date !== "" && Bahmni.Common.Util.DateUtil.isValid(date)) {
                date = isNaN(Number(date)) ? date : Number(date);
                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(date).split("-");
                var adDateObj = {
                    year: parseInt(adDate[0]),
                    month: parseInt(adDate[1]),
                    day: parseInt(adDate[2])
                };
                var bsDate = NepaliFunctions.AD2BS(adDateObj); 
                var monthName = NepaliFunctions.BS.GetMonthInUnicode(bsDate.month - 1);
                return `${NepaliFunctions.ConvertToUnicode(bsDate.year)} ${monthName}, ${NepaliFunctions.ConvertToUnicode(bsDate.day)}`; // "???? ?????, ??"
            }
            return date;
        };
    })
    //CHANGED BY BHAWANA
    .filter("npDateTime", function() {
        return function(date) {
            if (date != null && date !== undefined && date !== "" && Bahmni.Common.Util.DateUtil.isValid(date)) {
                date = isNaN(Number(date)) ? date : Number(date);
                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(date).split("-");
                var adDateObj = {
                    year: parseInt(adDate[0]),
                    month: parseInt(adDate[1]),
                    day: parseInt(adDate[2])
                };
                var bsDate = NepaliFunctions.AD2BS(adDateObj); 
                var monthName = NepaliFunctions.BS.GetMonth(bsDate.month - 1); 
                var shortYear = bsDate.year.toString().slice(-2); 
                var time = Bahmni.Common.Util.DateUtil.formatTime(date); 
                return `${shortYear} ${monthName}, ${bsDate.day} ${time}`; 
            }
            return date;
        };
    });
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.Logging = Bahmni.Common.Logging || {}, angular.module("bahmni.common.logging", []), angular.module("bahmni.common.logging").config(["$provide", function($provide) {
    $provide.decorator("$exceptionHandler", function($delegate, $injector, $window, $log) {
        var logError = function(exception, cause) {
                try {
                    var messagingService = $injector.get("messagingService"),
                        loggingService = $injector.get("loggingService"),
                        errorMessage = exception.toString(),
                        stackTrace = printStackTrace({
                            e: exception
                        }),
                        errorDetails = {
                            timestamp: new Date,
                            browser: $window.navigator.userAgent,
                            errorUrl: $window.location.href,
                            errorMessage: errorMessage,
                            stackTrace: stackTrace,
                            cause: cause || ""
                        };
                    loggingService.log(errorDetails), messagingService.showMessage("error", errorMessage), exposeException(errorDetails)
                } catch (loggingError) {
                    $log.warn("Error logging failed"), $log.log(loggingError)
                }
            },
            exposeException = function(exceptionDetails) {
                window.angular_exception = window.angular_exception || [], window.angular_exception.push(exceptionDetails)
            };
        return function(exception, cause) {
            $delegate(exception, cause), logError(exception, cause)
        }
    })
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {}, angular.module("bahmni.common.displaycontrol", []);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {}, Bahmni.Common.DisplayControl.Observation = Bahmni.Common.DisplayControl.Observation || {}, angular.module("bahmni.common.displaycontrol.observation", ["bahmni.common.conceptSet", "pascalprecht.translate"]), angular.module("bahmni.common.conceptSet").factory("formService", ["$http", function($http) {
    var getFormList = function(encounterUuid) {
            return $http.get(Bahmni.Common.Constants.latestPublishedForms, {
                params: {
                    encounterUuid: encounterUuid
                }
            })
        },
        getAllForms = function() {
            return $http.get(Bahmni.Common.Constants.allFormsUrl, {
                params: {
                    v: "custom:(version,name,uuid)"
                }
            })
        },
        getFormDetail = function(formUuid, params) {
            return $http.get(Bahmni.Common.Constants.formUrl + "/" + formUuid, {
                params: params
            })
        },
        getFormTranslations = function(url, form) {
            return url && url !== Bahmni.Common.Constants.formTranslationsUrl ? $http.get(url) : $http.get(Bahmni.Common.Constants.formTranslationsUrl, {
                params: form
            })
        };
    return {
        getFormList: getFormList,
        getAllForms: getAllForms,
        getFormDetail: getFormDetail,
        getFormTranslations: getFormTranslations
    }
}]), Bahmni.Common.DisplayControl.Observation.GroupingFunctions = function() {
    var self = this,
        observationGroupingFunction = function(obs) {
            return Bahmni.Common.Util.DateUtil.getDateTimeWithoutSeconds(obs.encounterDateTime)
        };
    return self.groupByEncounterDate = function(bahmniObservations) {
        var obsArray = [];
        bahmniObservations = _.groupBy(bahmniObservations, observationGroupingFunction);
        var sortWithInAConceptDateCombination = function(anObs, challengerObs) {
            return anObs.encounterDateTime < challengerObs.encounterDateTime ? 1 : anObs.encounterDateTime > challengerObs.encounterDateTime ? -1 : anObs.conceptSortWeight < challengerObs.conceptSortWeight ? -1 : anObs.conceptSortWeight > challengerObs.conceptSortWeight ? 1 : 0
        };
        for (var obsKey in bahmniObservations) {
            var dateTime = obsKey,
                anObs = {
                    key: dateTime,
                    value: bahmniObservations[dateTime].sort(sortWithInAConceptDateCombination),
                    date: dateTime
                };
            obsArray.push(anObs)
        }
        return _.sortBy(obsArray, "date").reverse()
    }, self.persistOrderOfConceptNames = function(bahmniObservations) {
        var obsArray = [];
        for (var obsKey in bahmniObservations) {
            var anObs = {
                key: obsKey,
                value: [bahmniObservations[obsKey]],
                date: bahmniObservations[obsKey].encounterDateTime
            };
            obsArray.push(anObs)
        }
        return obsArray
    }, self
}, angular.module("bahmni.common.displaycontrol.observation").service("formHierarchyService", ["formService", function(formService) {
    var self = this;
    self.build = function(observations) {
        var obs = self.preProcessMultipleSelectObsToObs(observations);
        obs = self.createDummyObsGroupForObservationsForForm(obs), self.createDummyObsGroupForSectionsForForm(obs)
    }, self.preProcessMultipleSelectObsToObs = function(observations) {
        return _.forEach(observations, function(obs) {
            _.forEach(obs.value, function(value, index) {
                "multiSelect" == value.type && (obs.value.push(value.groupMembers[0]), obs.value.splice(index, 1))
            })
        }), observations
    }, self.createDummyObsGroupForObservationsForForm = function(observations) {
        return _.forEach(observations, function(obs) {
            var newValues = [];
            _.forEach(obs.value, function(value) {
                if (!value.formFieldPath) return void newValues.push(value);
                var dummyObsGroup = {
                    groupMembers: [],
                    concept: {
                        shortName: "",
                        conceptClass: null
                    },
                    encounterUuid: ""
                };
                dummyObsGroup.concept.shortName = value.formFieldPath.split(".")[0], dummyObsGroup.encounterUuid = value.encounterUuid;
                var previousDummyObsGroupFound;
                _.forEach(newValues, function(newValue) {
                    dummyObsGroup.concept.shortName == newValue.concept.shortName && (newValue.groupMembers.push(value), previousDummyObsGroupFound = !0)
                }), previousDummyObsGroupFound || (dummyObsGroup.groupMembers.push(value), newValues.push(dummyObsGroup))
            }), obs.value = newValues
        }), observations
    }, self.getFormVersion = function(members) {
        var formVersion;
        return _.forEach(members, function(member) {
            if (member.formFieldPath) return formVersion = member.formFieldPath.split(".")[1].split("/")[0], !1
        }), formVersion
    }, self.getMemberFromFormByFormFieldPath = function(members, id) {
        return _.filter(members, function(member) {
            return member.formFieldPath.split(".")[1].split("/")[1].split("-")[0] == id
        })
    }, self.getFormByFormName = function(formList, formName, formVersion) {
        return _.find(formList, function(form) {
            return form.name == formName && form.version == formVersion
        })
    }, self.parseSection = function(members, controls, value) {
        var sectionIsEmpty = !0;
        return _.forEach(controls, function(control) {
            var dummyObsGroup = {
                groupMembers: [],
                concept: {
                    shortName: "",
                    conceptClass: null
                }
            };
            if ("section" == control.type) dummyObsGroup.concept.shortName = control.label.value, value.groupMembers.push(dummyObsGroup), self.parseSection(members, control.controls, dummyObsGroup) ? sectionIsEmpty = !1 : value.groupMembers.pop();
            else {
                var member = self.getMemberFromFormByFormFieldPath(members, control.id);
                0 != member.length && (0 != member[0].formFieldPath.split("-")[1] && _.reverse(member), _.map(member, function(m) {
                    value.groupMembers.push(m)
                }), sectionIsEmpty = !1)
            }
        }), sectionIsEmpty ? null : value
    }, self.createSectionForSingleForm = function(obsFromSameForm, formDetails) {
        var members = obsFromSameForm.groupMembers.slice();
        return obsFromSameForm.groupMembers.splice(0, obsFromSameForm.groupMembers.length), self.parseSection(members, formDetails.controls, obsFromSameForm)
    }, self.createDummyObsGroupForSectionsForForm = function(bahmniObservations) {
        _.isEmpty(bahmniObservations) || formService.getAllForms().then(function(response) {
            var allForms = response.data;
            _.forEach(bahmniObservations, function(observation) {
                var forms = [];
                _.forEach(observation.value, function(form) {
                    if (form.concept.conceptClass) return void forms.push(form);
                    var observationForm = self.getFormByFormName(allForms, form.concept.shortName, self.getFormVersion(form.groupMembers));
                    observationForm && formService.getFormDetail(observationForm.uuid, {
                        v: "custom:(resources:(value))"
                    }).then(function(response) {
                        var formDetailsAsString = _.get(response, "data.resources[0].value");
                        if (formDetailsAsString) {
                            var formDetails = JSON.parse(formDetailsAsString);
                            forms.push(self.createSectionForSingleForm(form, formDetails))
                        }
                        observation.value = forms
                    })
                })
            })
        })
    }
}]), angular.module("bahmni.common.displaycontrol.observation").directive("bahmniObservation", ["observationsService", "appService", "$q", "spinner", "$rootScope", "formHierarchyService", "$translate", function(observationsService, appService, $q, spinner, $rootScope, formHierarchyService, $translate) {
    var controller = function($scope) {
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.print = $rootScope.isBeingPrinted || !1, $scope.showGroupDateTime = $scope.config.showGroupDateTime !== !1;
            var mapObservation = function(observations) {
                    var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                    observations = (new Bahmni.Common.Obs.ObservationMapper).map(observations, conceptsConfig), $scope.config.conceptNames && (observations = _.filter(observations, function(observation) {
                        return _.some($scope.config.conceptNames, function(conceptName) {
                            return _.toLower(conceptName) === _.toLower(_.get(observation, "concept.name"))
                        })
                    })), $scope.config.persistOrderOfConcepts ? $scope.bahmniObservations = (new Bahmni.Common.DisplayControl.Observation.GroupingFunctions).persistOrderOfConceptNames(observations) : $scope.bahmniObservations = (new Bahmni.Common.DisplayControl.Observation.GroupingFunctions).groupByEncounterDate(observations), _.isEmpty($scope.bahmniObservations) ? ($scope.noObsMessage = $translate.instant(Bahmni.Common.Constants.messageForNoObservation), $scope.$emit("no-data-present-event")) : $scope.showGroupDateTime ? $scope.bahmniObservations[0].isOpen = !0 : _.forEach($scope.bahmniObservations, function(bahmniObs) {
                        bahmniObs.isOpen = !0
                    });
                    var formObservations = _.filter(observations, function(obs) {
                        return obs.formFieldPath
                    });
                    formObservations.length > 0 && formHierarchyService.build($scope.bahmniObservations)
                },
                fetchObservations = function() {
                    if ($scope.observations) mapObservation($scope.observations, $scope.config), $scope.isFulfilmentDisplayControl = !0;
                    else if ($scope.config.observationUuid) $scope.initialization = observationsService.getByUuid($scope.config.observationUuid).then(function(response) {
                        mapObservation([response.data], $scope.config)
                    });
                    else if ($scope.config.encounterUuid) {
                        var fetchForEncounter = observationsService.fetchForEncounter($scope.config.encounterUuid, $scope.config.conceptNames);
                        $scope.initialization = fetchForEncounter.then(function(response) {
                            mapObservation(response.data, $scope.config)
                        })
                    } else $scope.enrollment ? $scope.initialization = observationsService.fetchForPatientProgram($scope.enrollment, $scope.config.conceptNames, $scope.config.scope, $scope.config.obsIgnoreList).then(function(response) {
                        mapObservation(response.data, $scope.config)
                    }) : $scope.initialization = observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames, $scope.config.scope, $scope.config.numberOfVisits, $scope.visitUuid, $scope.config.obsIgnoreList, null).then(function(response) {
                        mapObservation(response.data, $scope.config)
                    })
                };
            $scope.toggle = function(element) {
                element.isOpen = !element.isOpen
            }, $scope.isClickable = function() {
                return $scope.isOnDashboard && $scope.section.expandedViewConfig && ($scope.section.expandedViewConfig.pivotTable || $scope.section.expandedViewConfig.observationGraph)
            }, fetchObservations(), $scope.dialogData = {
                patient: $scope.patient,
                section: $scope.section
            }
        },
        link = function($scope, element) {
            $scope.initialization && spinner.forPromise($scope.initialization, element)
        };
    return {
        restrict: "E",
        controller: controller,
        link: link,
        templateUrl: "../common/displaycontrols/observation/views/observationDisplayControl.html",
        scope: {
            patient: "=",
            visitUuid: "@",
            section: "=?",
            config: "=",
            title: "=sectionTitle",
            isOnDashboard: "=?",
            observations: "=?",
            message: "=?",
            enrollment: "=?"
        }
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {}, Bahmni.Common.DisplayControl.PivotTable = Bahmni.Common.DisplayControl.PivotTable || {}, angular.module("bahmni.common.displaycontrol", []), angular.module("bahmni.common.displaycontrol.pivottable", []), angular.module("bahmni.common.displaycontrol.pivottable").directive("pivotTable", ["$rootScope", "$filter", "$stateParams", "spinner", "pivotTableService", "appService", "conceptSetUiConfigService", "$interval", function($rootScope, $filter, $stateParams, spinner, pivotTableService, appService, conceptSetUiConfigService, $interval) {
    return {
        scope: {
            patientUuid: "=",
            diseaseName: "=",
            displayName: "=",
            config: "=",
            visitUuid: "=",
            status: "=?"
        },
        link: function(scope, element) {
            var tablescroll;
            if (scope.config) {
                scope.groupBy = scope.config.groupBy || "visits", scope.groupByEncounters = "encounters" === scope.groupBy, scope.groupByVisits = "visits" === scope.groupBy, scope.getOnlyDate = function(startdate) {
                    return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(startdate)
                }, scope.getOnlyTime = function(startDate) {
                    return Bahmni.Common.Util.DateUtil.formatTime(startDate)
                }, scope.isLonger = function(value) {
                    return !!value && value.length > 13
                }, scope.getColumnValue = function(value, conceptName) {
                    return conceptName && conceptSetUiConfigService.getConfig()[conceptName] && 1 == conceptSetUiConfigService.getConfig()[conceptName].displayMonthAndYear ? Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(value) : scope.isLonger(value) ? value.substring(0, 10) + "..." : value
                }, scope.scrollLeft = function() {
                    return $("table.pivot-table tbody").animate({
                        scrollLeft: 0
                    }), !1
                }, scope.scrollRight = function() {
                    return $("table.pivot-table tbody").animate({
                        scrollLeft: tablescroll
                    }), !1
                };
                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {},
                    startDate = null,
                    endDate = null;
                programConfig.showDetailsWithinDateRange && (startDate = $stateParams.dateEnrolled, endDate = $stateParams.dateCompleted);
                var checkIfPivotTableLoaded = $interval(function() {
                        $("table.pivot-table tbody tr").length > 11 ? ($("table.pivot-table tbody").animate({
                            scrollLeft: "20000px"
                        }, 500), tablescroll = $("table.pivot-table tbody").scrollLeft(), clearInterval(checkIfPivotTableLoaded)) : $("table.pivot-table tbody tr").length < 12 && ($(".btn-scroll-right, .btn-scroll-left").attr("disabled", !0), clearInterval(checkIfPivotTableLoaded))
                    }, 1e3, 2),
                    pivotDataPromise = pivotTableService.getPivotTableFor(scope.patientUuid, scope.config, scope.visitUuid, startDate, endDate);
                spinner.forPromise(pivotDataPromise, element), pivotDataPromise.then(function(response) {
                    var concepts = _.map(response.data.conceptDetails, function(conceptDetail) {
                            return {
                                name: conceptDetail.fullName,
                                shortName: conceptDetail.name,
                                lowNormal: conceptDetail.lowNormal,
                                hiNormal: conceptDetail.hiNormal,
                                units: conceptDetail.units
                            }
                        }),
                        tabluarDataInAscOrderByDate = _(response.data.tabularData).toPairs().sortBy(0).fromPairs().value();
                    scope.result = {
                        concepts: concepts,
                        tabularData: tabluarDataInAscOrderByDate
                    }, scope.hasData = !_.isEmpty(scope.result.tabularData), scope.status = scope.status || {}, scope.status.data = scope.hasData
                }), scope.showOnPrint = !$rootScope.isBeingPrinted
            }
        },
        templateUrl: "../common/displaycontrols/pivottable/views/pivotTable.html"
    }
}]), angular.module("bahmni.common.displaycontrol.pivottable").service("pivotTableService", ["$http", function($http) {
    this.getPivotTableFor = function(patientUuid, diseaseSummaryConfig, visitUuid, startDate, endDate) {
        return $http.get(Bahmni.Common.Constants.diseaseSummaryPivotUrl, {
            params: {
                patientUuid: patientUuid,
                visit: visitUuid,
                numberOfVisits: diseaseSummaryConfig.numberOfVisits,
                initialCount: diseaseSummaryConfig.initialCount,
                latestCount: diseaseSummaryConfig.latestCount,
                obsConcepts: diseaseSummaryConfig.obsConcepts,
                drugConcepts: diseaseSummaryConfig.drugConcepts,
                labConcepts: diseaseSummaryConfig.labConcepts,
                groupBy: diseaseSummaryConfig.groupBy,
                startDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDate),
                endDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDate)
            }
        })
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {}, Bahmni.Common.DisplayControl.Custom = Bahmni.Common.DisplayControl.Custom || {}, angular.module("bahmni.common.displaycontrol.custom", []), angular.module("bahmni.common.displaycontrol.custom").directive("customDisplayControl", [function() {
    return {
        restrict: "E",
        template: '<div compile-html="config.template"></div>',
        scope: {
            patient: "=",
            visitUuid: "=",
            section: "=",
            config: "=",
            enrollment: "=",
            params: "=",
            visitSummary: "="
        }
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.Obs = Bahmni.Common.Obs || {}, angular.module("bahmni.common.obs", []), Bahmni.Common.Obs.Observation = function() {
    var Observation = function(obs, conceptConfig) {
        angular.extend(this, obs), this.concept = obs.concept, this.conceptConfig = conceptConfig
    };
    return Observation.prototype = {
        isFormElement: function() {
            return this.groupMembers && this.groupMembers.length <= 0
        },
        isImageConcept: function() {
            return "Image" === this.concept.conceptClass
        },
        isVideoConcept: function() {
            return "Video" === this.concept.conceptClass
        },
        hasPDFAsValue: function() {
            return this.value.indexOf(".pdf") > 0
        },
        isComplexConcept: function() {
            return "Complex" === this.concept.dataType
        },
        getComplexDataType: function() {
            return this.complexData ? this.complexData.dataType : null
        },
        isLocationRef: function() {
            return this.isComplexConcept() && "Location" === this.getComplexDataType()
        },
        isProviderRef: function() {
            return this.isComplexConcept() && "Provider" === this.getComplexDataType()
        },
        getDisplayValue: function() {
            var value;
            if ("Boolean" === this.type || this.concept && "Boolean" === this.concept.dataType) return this.value === !0 ? "OBS_BOOLEAN_YES_KEY" : "OBS_BOOLEAN_NO_KEY";
            if ("Datetime" === this.type || this.concept && "Datetime" === this.concept.dataType) {
                var date = Bahmni.Common.Util.DateUtil.parseDatetime(this.value);
                return null != date ? Bahmni.Common.Util.DateUtil.formatDateWithTime(date) : ""
            }
            if (this.conceptConfig && this.conceptConfig.displayMonthAndYear && (value = Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(this.value), null != value)) return value;
            if ("Date" === this.type || this.concept && "Date" === this.concept.dataType) return this.value ? Bahmni.Common.Util.DateUtil.formatDateWithoutTime(this.value) : "";
            if (this.isLocationRef()) return this.complexData.display;
            if (this.isProviderRef()) return this.complexData.display;
            value = this.value;
            var displayValue = value && (value.shortName || value.name && (value.name.name || value.name) || value);
            return this.duration && (displayValue = displayValue + " " + this.getDurationDisplayValue()), displayValue
        },
        getDurationDisplayValue: function() {
            var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(this.duration);
            return "since " + durationForDisplay.value + " " + durationForDisplay.unitName
        }
    }, Observation
}(), Bahmni.Common.Obs.MultiSelectObservation = function() {
    var MultiSelectObservation = function(groupMembers, conceptConfig) {
            this.type = "multiSelect", this.concept = groupMembers[0].concept, this.encounterDateTime = groupMembers[0].encounterDateTime, this.groupMembers = groupMembers, this.conceptConfig = conceptConfig, this.observationDateTime = getLatestObservationDateTime(this.groupMembers), this.providers = groupMembers[0].providers, this.creatorName = groupMembers[0].creatorName
        },
        getLatestObservationDateTime = function(groupMembers) {
            var latestObservationDateTime = groupMembers[0].observationDateTime;
            return groupMembers.forEach(function(member) {
                latestObservationDateTime = latestObservationDateTime < member.observationDateTime ? member.observationDateTime : latestObservationDateTime
            }), latestObservationDateTime
        };
    return MultiSelectObservation.prototype = {
        isFormElement: function() {
            return !0
        },
        getDisplayValue: function() {
            var getName = Bahmni.Common.Domain.ObservationValueMapper.getNameFor.Object;
            return _.map(this.groupMembers, getName).join(", ")
        }
    }, MultiSelectObservation
}(), Bahmni.Common.Obs.GridObservation = function() {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper,
        GridObservation = function(obs, conceptConfig) {
            angular.extend(this, obs), this.type = "grid", this.conceptConfig = conceptConfig
        },
        getObservationDisplayValue = function(observation) {
            if (observation.isBoolean || "Boolean" === observation.type) return observation.value === !0 ? "OBS_BOOLEAN_YES_KEY" : "OBS_BOOLEAN_NO_KEY";
            if (!observation.value) return "";
            if ("object" == typeof observation.value.name) {
                var valueConcept = conceptMapper.map(observation.value);
                return valueConcept.shortName || valueConcept.name
            }
            return observation.value.shortName || observation.value.name || observation.value
        };
    return GridObservation.prototype = {
        isFormElement: function() {
            return !0
        },
        getDisplayValue: function() {
            var gridObservationDisplayValue = _.compact(_.map(this.groupMembers, function(member) {
                return getObservationDisplayValue(member)
            })).join(", ");
            return gridObservationDisplayValue || this.value
        }
    }, GridObservation
}(), Bahmni.Common.Obs.ImageObservation = function(observation, concept, provider) {
    this.concept = concept, this.imageObservation = observation, this.dateTime = observation.observationDateTime, this.provider = provider
}, Bahmni.Common.Obs.ObservationMapper = function() {
    var conceptMapper = new Bahmni.Common.Domain.ConceptMapper;
    this.map = function(bahmniObservations, allConceptsConfig, dontSortByObsDateTime) {
        var mappedObservations = mapObservations(bahmniObservations, allConceptsConfig, dontSortByObsDateTime);
        return mapUIObservations(mappedObservations, allConceptsConfig)
    };
    var mapObservations = function(bahmniObservations, allConceptsConfig, dontSortByObsDateTime) {
            var mappedObservations = [];
            return bahmniObservations = dontSortByObsDateTime ? _.flatten(bahmniObservations) : Bahmni.Common.Obs.ObservationUtil.sortSameConceptsWithObsDateTime(bahmniObservations), $.each(bahmniObservations, function(i, bahmniObservation) {
                var conceptConfig = allConceptsConfig[bahmniObservation.concept.name] || [],
                    observation = new Bahmni.Common.Obs.Observation(bahmniObservation, conceptConfig);
                observation.groupMembers && observation.groupMembers.length >= 0 && (observation.groupMembers = mapObservations(observation.groupMembers, allConceptsConfig, dontSortByObsDateTime)), mappedObservations.push(observation)
            }), mappedObservations
        },
        mapUIObservations = function(observations, allConceptsConfig) {
            var groupedObservations = _.groupBy(observations, function(observation) {
                    return observation.concept.name
                }),
                mappedObservations = [];
            return $.each(groupedObservations, function(i, obsGroup) {
                var conceptConfig = allConceptsConfig[obsGroup[0].concept.name] || [];
                if (conceptConfig.multiSelect) {
                    var multiSelectObservations = {};
                    $.each(obsGroup, function(i, observation) {
                        if (multiSelectObservations[observation.encounterDateTime]) multiSelectObservations[observation.encounterDateTime].push(observation);
                        else {
                            var observations = [];
                            observations.push(observation), multiSelectObservations[observation.encounterDateTime] = observations
                        }
                    }), $.each(multiSelectObservations, function(i, observations) {
                        mappedObservations.push(new Bahmni.Common.Obs.MultiSelectObservation(observations, conceptConfig))
                    })
                } else conceptConfig.grid ? mappedObservations.push(new Bahmni.Common.Obs.GridObservation(obsGroup[0], conceptConfig)) : $.each(obsGroup, function(i, obs) {
                    obs.groupMembers = mapUIObservations(obs.groupMembers, allConceptsConfig), mappedObservations.push(obs)
                })
            }), mappedObservations
        };
    this.getGridObservationDisplayValue = function(observationTemplate) {
        var memberValues = _.compact(_.map(observationTemplate.bahmniObservations, function(observation) {
            return getObservationDisplayValue(observation)
        }));
        return memberValues.join(", ")
    };
    var getObservationDisplayValue = function(observation) {
        if (observation.isBoolean || "Boolean" === observation.type) return observation.value === !0 ? "Yes" : "No";
        if (!observation.value) return "";
        if ("object" == typeof observation.value.name) {
            var valueConcept = conceptMapper.map(observation.value);
            return valueConcept.shortName || valueConcept.name
        }
        return observation.value.shortName || observation.value.name || observation.value
    }
}, angular.module("bahmni.common.obs").directive("showObservation", ["appService", "ngDialog", function(appService, ngDialog) {
    var controller = function($scope, $rootScope, $filter) {
        $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.toggle = function(observation) {
            observation.showDetails = !observation.showDetails
        }, $scope.print = $rootScope.isBeingPrinted || !1, $scope.dateString = function(observation) {
            var filterName;
            if ($scope.showDate && $scope.showTime && !$scope.displayNepaliDates) filterName = "bahmniDateTime";
            else if ($scope.showDate && $scope.showTime && $scope.displayNepaliDates) filterName = "npDateTime";
            else {
                if ($scope.showDate || !$scope.showTime && void 0 !== $scope.showTime) return null;
                filterName = "bahmniTime"
            }
            return $filter(filterName)(observation.observationDateTime)
        }, $scope.openVideoInPopup = function(observation) {
            ngDialog.open({
                template: "../common/obs/views/showVideo.html",
                closeByDocument: !1,
                className: "ngdialog-theme-default",
                showClose: !0,
                data: {
                    observation: observation
                }
            })
        }
    };
    return {
        restrict: "E",
        scope: {
            observation: "=?",
            patient: "=",
            showDate: "=?",
            showTime: "=?",
            showDetailsButton: "=?"
        },
        controller: controller,
        template: "<ng-include src=\"'../common/obs/views/showObservation.html'\" />"
    }
}]), Bahmni.Common.Obs.ObservationUtil = function() {
    var sortSameConceptsWithObsDateTime = function(observation) {
            for (var sortedObservations = [], i = 0; i < observation.length; i++)
                if (i !== observation.length - 1)
                    if (observation[i].conceptUuid !== observation[i + 1].conceptUuid) sortedObservations.push(observation[i]);
                    else {
                        var sameConceptsSubArray = [],
                            j = i + 1;
                        for (sameConceptsSubArray.push(observation[i]); j < observation.length && observation[i].conceptUuid === observation[j].conceptUuid;) sameConceptsSubArray.push(observation[j++]);
                        sameConceptsSubArray = _.sortBy(sameConceptsSubArray, "observationDateTime"), sortedObservations.push(sameConceptsSubArray), i = j - 1
                    }
            else sortedObservations.push(observation[i]);
            return _.flatten(sortedObservations)
        },
        getValue = function(observation) {
            if (observation.selectedObs) return observation.getValues();
            var obsValue;
            return obsValue = observation.value && observation.value.name && observation.value.name.name ? observation.value.name.name : observation.value && observation.value.name && !observation.value.name.name ? observation.value.name : observation.value, void 0 === obsValue || null === obsValue ? obsValue : obsValue.displayString || obsValue
        },
        collect = function(flattenedObservations, key, value) {
            void 0 != value && (flattenedObservations[key] = flattenedObservations[key] ? _.uniq(_.flatten(_.union([flattenedObservations[key]], [value]))) : value)
        },
        findLeafObservations = function(flattenedObservations, observation) {
            _.isEmpty(observation.groupMembers) ? collect(flattenedObservations, observation.concept.name, getValue(observation)) : _.each(observation.groupMembers, function(member) {
                findLeafObservations(flattenedObservations, member)
            })
        },
        flatten = function(observation) {
            var flattenedObservation = {};
            return _.isEmpty(observation) || findLeafObservations(flattenedObservation, observation), flattenedObservation
        },
        flattenObsToArray = function(observations) {
            var flattened = [];
            return flattened.push.apply(flattened, observations), observations.forEach(function(obs) {
                obs.groupMembers && obs.groupMembers.length > 0 && flattened.push.apply(flattened, flattenObsToArray(obs.groupMembers))
            }), flattened
        };
    return {
        sortSameConceptsWithObsDateTime: sortSameConceptsWithObsDateTime,
        flatten: flatten,
        flattenObsToArray: flattenObsToArray
    }
}();
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {}, Bahmni.Common.DisplayControl.hint = Bahmni.Common.DisplayControl.hint || {}, angular.module("bahmni.common.displaycontrol.hint", []), angular.module("bahmni.common.displaycontrol.hint").directive("hint", [function() {
    var link = function($scope) {
        $scope.hintForNumericConcept = Bahmni.Common.Domain.Helper.getHintForNumericConcept($scope.conceptDetails)
    };
    return {
        restrict: "E",
        link: link,
        template: '<small class="hint" ng-if="::hintForNumericConcept">{{::hintForNumericConcept}}</small>',
        scope: {
            conceptDetails: "="
        }
    }
}]), Bahmni.Common.Domain.Diagnosis = function(codedAnswer, order, certainty, existingObsUuid, freeTextAnswer, diagnosisDateTime, voided) {
    var self = this;
    self.codedAnswer = codedAnswer, self.order = order, self.certainty = certainty, self.existingObs = existingObsUuid, self.freeTextAnswer = freeTextAnswer, self.diagnosisDateTime = diagnosisDateTime, self.diagnosisStatus = void 0, self.isNonCodedAnswer = !1, self.codedAnswer && (self.conceptName = self.codedAnswer.name), self.voided = voided, self.firstDiagnosis = null, self.comments = "", self.getDisplayName = function() {
        return self.freeTextAnswer ? self.freeTextAnswer : self.codedAnswer.shortName || self.codedAnswer.name
    }, self.isPrimary = function() {
        return "PRIMARY" == self.order
    }, self.isSecondary = function() {
        return "SECONDARY" == self.order
    }, self.isRuledOut = function() {
        return self.diagnosisStatus == $rootScope.diagnosisStatus
    }, self.answerNotFilled = function() {
        return !self.codedAnswer.name
    }, self.isValidAnswer = function() {
        return self.codedAnswer.name && self.codedAnswer.uuid || self.codedAnswer.name && !self.codedAnswer.uuid && self.isNonCodedAnswer || self.answerNotFilled()
    }, self.isValidOrder = function() {
        return self.isEmpty() || void 0 !== self.order
    }, self.isValidCertainty = function() {
        return self.isEmpty() || void 0 !== self.certainty
    }, self.isEmpty = function() {
        return void 0 === self.getDisplayName() || 0 === self.getDisplayName().length
    }, self.diagnosisStatusValue = null, self.diagnosisStatusConcept = null, Object.defineProperty(this, "diagnosisStatus", {
        get: function() {
            return this.diagnosisStatusValue
        },
        set: function(newStatus) {
            newStatus ? (this.diagnosisStatusValue = newStatus, this.diagnosisStatusConcept = {
                name: Bahmni.Common.Constants.ruledOutdiagnosisStatus
            }) : (this.diagnosisStatusValue = null, this.diagnosisStatusConcept = null)
        }
    }), self.clearCodedAnswerUuid = function() {
        self.codedAnswer.uuid = void 0
    }, self.setAsNonCodedAnswer = function() {
        self.isNonCodedAnswer = !self.isNonCodedAnswer
    }
}, Bahmni.DiagnosisMapper = function(diagnosisStatus) {
    var self = this,
        mapDiagnosis = function(diagnosis) {
            diagnosis.codedAnswer || (diagnosis.codedAnswer = {
                name: void 0,
                uuid: void 0
            });
            var mappedDiagnosis = angular.extend(new Bahmni.Common.Domain.Diagnosis, diagnosis);
            return mappedDiagnosis.firstDiagnosis && (mappedDiagnosis.firstDiagnosis = mapDiagnosis(mappedDiagnosis.firstDiagnosis)), mappedDiagnosis.latestDiagnosis && (mappedDiagnosis.latestDiagnosis = mapDiagnosis(mappedDiagnosis.latestDiagnosis)), diagnosis.diagnosisStatusConcept && Bahmni.Common.Constants.ruledOutdiagnosisStatus === diagnosis.diagnosisStatusConcept.name && (mappedDiagnosis.diagnosisStatus = diagnosisStatus), mappedDiagnosis
        };
    self.mapDiagnosis = mapDiagnosis, self.mapDiagnoses = function(diagnoses) {
        var mappedDiagnoses = [];
        return _.each(diagnoses, function(diagnosis) {
            mappedDiagnoses.push(mapDiagnosis(diagnosis))
        }), mappedDiagnoses
    }, self.mapPastDiagnosis = function(diagnoses, currentEncounterUuid) {
        var pastDiagnosesResponse = [];
        return diagnoses.forEach(function(diagnosis) {
            diagnosis.encounterUuid !== currentEncounterUuid && (diagnosis.previousObs = diagnosis.existingObs, diagnosis.existingObs = null, diagnosis.inCurrentEncounter = void 0, pastDiagnosesResponse.push(diagnosis))
        }), pastDiagnosesResponse
    }, self.mapSavedDiagnosesFromCurrentEncounter = function(diagnoses, currentEncounterUuid) {
        var savedDiagnosesFromCurrentEncounter = [];
        return diagnoses.forEach(function(diagnosis) {
            diagnosis.encounterUuid === currentEncounterUuid && (diagnosis.inCurrentEncounter = !0, savedDiagnosesFromCurrentEncounter.push(diagnosis))
        }), savedDiagnosesFromCurrentEncounter
    }
}, angular.module("bahmni.common.domain").service("diagnosisService", ["$http", "$rootScope", function($http, $rootScope) {
    var self = this;
    this.getAllFor = function(searchTerm) {
        var url = Bahmni.Common.Constants.emrapiConceptUrl;
        return $http.get(url, {
            params: {
                term: searchTerm,
                limit: 20
            }
        })
    }, this.getDiagnoses = function(patientUuid, visitUuid) {
        var url = Bahmni.Common.Constants.bahmniDiagnosisUrl;
        return $http.get(url, {
            params: {
                patientUuid: patientUuid,
                visitUuid: visitUuid
            }
        })
    }, this.deleteDiagnosis = function(obsUuid) {
        var url = Bahmni.Common.Constants.bahmniDeleteDiagnosisUrl;
        return $http.get(url, {
            params: {
                obsUuid: obsUuid
            }
        })
    }, this.getDiagnosisConceptSet = function() {
        return $http.get(Bahmni.Common.Constants.conceptUrl, {
            method: "GET",
            params: {
                v: "custom:(uuid,name,setMembers)",
                code: Bahmni.Common.Constants.diagnosisConceptSet,
                source: Bahmni.Common.Constants.emrapiConceptMappingSource
            },
            withCredentials: !0
        })
    }, this.getPastAndCurrentDiagnoses = function(patientUuid, encounterUuid) {
        return self.getDiagnoses(patientUuid).then(function(response) {
            var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus),
                allDiagnoses = diagnosisMapper.mapDiagnoses(response.data),
                pastDiagnoses = diagnosisMapper.mapPastDiagnosis(allDiagnoses, encounterUuid),
                savedDiagnosesFromCurrentEncounter = diagnosisMapper.mapSavedDiagnosesFromCurrentEncounter(allDiagnoses, encounterUuid);
            return {
                pastDiagnoses: pastDiagnoses,
                savedDiagnosesFromCurrentEncounter: savedDiagnosesFromCurrentEncounter
            }
        })
    }, this.populateDiagnosisInformation = function(patientUuid, consultation) {
        return this.getPastAndCurrentDiagnoses(patientUuid, consultation.encounterUuid).then(function(diagnosis) {
            return consultation.pastDiagnoses = diagnosis.pastDiagnoses, consultation.savedDiagnosesFromCurrentEncounter = diagnosis.savedDiagnosesFromCurrentEncounter, consultation
        })
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.DisplayControl = Bahmni.Common.DisplayControl || {}, Bahmni.Common.DisplayControl.Diagnosis = Bahmni.Common.DisplayControl.Diagnosis || {}, angular.module("bahmni.common.displaycontrol.diagnosis", []), angular.module("bahmni.common.displaycontrol.diagnosis").filter("primaryDiagnosisFirst", function() {
    return function(diagnoses) {
        var primaryDiagnoses = _.filter(diagnoses, function(diagnosis) {
                return diagnosis.isPrimary()
            }),
            otherDiagnoses = _.filter(diagnoses, function(diagnosis) {
                return !diagnosis.isPrimary()
            });
        return primaryDiagnoses.concat(otherDiagnoses)
    }
}), angular.module("bahmni.common.displaycontrol.diagnosis").directive("bahmniDiagnosis", ["diagnosisService", "$q", "spinner", "$rootScope", "$filter", "appService", function(diagnosisService, $q, spinner, $rootScope, $filter, appService) {
    var controller = function($scope) {
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates");
            var getAllDiagnosis = function() {
                return diagnosisService.getDiagnoses($scope.patientUuid, $scope.visitUuid).then(function(response) {
                    var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus);
                    $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response.data), 0 == $scope.showRuledOutDiagnoses && ($scope.allDiagnoses = _.filter($scope.allDiagnoses, function(diagnoses) {
                        return diagnoses.diagnosisStatus !== $rootScope.diagnosisStatus
                    })), $scope.isDataPresent = function() {
                        return !$scope.allDiagnoses || 0 != $scope.allDiagnoses.length || ($scope.$emit("no-data-present-event"), !1)
                    }
                })
            };
            $scope.title = $scope.config.title, $scope.toggle = function(diagnosis, toggleLatest) {
                toggleLatest ? (diagnosis.showDetails = !1, diagnosis.showLatestDetails = !diagnosis.showLatestDetails) : (diagnosis.showLatestDetails = !1, diagnosis.showDetails = !diagnosis.showDetails)
            };
            var getPromises = function() {
                return [getAllDiagnosis()]
            };
            $scope.isLatestDiagnosis = function(diagnosis) {
                return !!diagnosis.latestDiagnosis && diagnosis.existingObs == diagnosis.latestDiagnosis.existingObs
            }, $scope.initialization = $q.all(getPromises())
        },
        link = function($scope, element) {
            spinner.forPromise($scope.initialization, element)
        };
    return {
        restrict: "E",
        controller: controller,
        link: link,
        templateUrl: "../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html",
        scope: {
            patientUuid: "=",
            config: "=",
            visitUuid: "=?",
            showRuledOutDiagnoses: "=?",
            hideTitle: "=?",
            showLatestDiagnosis: "@showLatestDiagnosis"
        }
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.I18n = Bahmni.Common.I18n || {}, angular.module("bahmni.common.i18n", []), angular.module("bahmni.common.i18n", ["pascalprecht.translate"]).provider("$bahmniTranslate", ["$translateProvider", function($translateProvider) {
    this.init = function(options) {
        var preferredLanguage = window.localStorage.NG_TRANSLATE_LANG_KEY || "en";
        $translateProvider.useLoader("mergeLocaleFilesService", options), $translateProvider.useSanitizeValueStrategy("escaped"), $translateProvider.preferredLanguage(preferredLanguage), $translateProvider.useLocalStorage()
    }, this.$get = [function() {
        return $translateProvider
    }]
}]).filter("titleTranslate", ["$translate", function($translate) {
    return function(input) {
        return input ? input.translationKey ? $translate.instant(input.translationKey) : input.dashboardName ? input.dashboardName : input.title ? input.title : input.label ? input.label : input.display ? input.display : $translate.instant(input) : input
    }
}]), angular.module("bahmni.common.i18n").service("mergeLocaleFilesService", ["$http", "$q", "mergeService", function($http, $q, mergeService) {
    return function(options) {
        var baseLocaleUrl = "../i18n/",
            customLocaleUrl = Bahmni.Common.Constants.rootDir + "/bahmni_config/openmrs/i18n/",
            loadFile = function(url) {
                return $http.get(url, {
                    withCredentials: !0
                })
            },
            mergeLocaleFile = function(options) {
                var fileURL = options.app + "/locale_" + options.key + ".json",
                    loadBahmniTranslations = function() {
                        return loadFile(baseLocaleUrl + fileURL).then(function(result) {
                            return result
                        }, function() {})
                    },
                    loadCustomTranslations = function() {
                        return loadFile(customLocaleUrl + fileURL).then(function(result) {
                            return result
                        }, function() {})
                    },
                    mergeTranslations = function(result) {
                        var baseFileData = result[0] ? result[0].data : void 0,
                            customFileData = result[1] ? result[1].data : void 0;
                        return options.shouldMerge || void 0 === options.shouldMerge ? mergeService.merge(baseFileData, customFileData) : [baseFileData, customFileData]
                    };
                return $q.all([loadBahmniTranslations(), loadCustomTranslations()]).then(mergeTranslations)
            };
        return mergeLocaleFile(options)
    }
}]);
var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {}, Bahmni.Registration.AttributesConditions = Bahmni.Registration.AttributesConditions || {}, angular.module("bahmni.registration", ["ui.router", "bahmni.common.config", "bahmni.common.domain", "bahmni.common.util", "bahmni.common.uiHelper", "bahmni.common.conceptSet", "infinite-scroll", "bahmni.common.patient", "bahmni.common.logging", "pascalprecht.translate"]), angular.module("registration", ["ui.router", "bahmni.registration", "authentication", "bahmni.common.config", "bahmni.common.appFramework", "httpErrorInterceptor", "bahmni.common.photoCapture", "bahmni.common.obs", "bahmni.common.displaycontrol.observation", "bahmni.common.i18n", "bahmni.common.displaycontrol.custom", "bahmni.common.routeErrorHandler", "bahmni.common.displaycontrol.pivottable", "RecursionHelper", "ngSanitize", "bahmni.common.uiHelper", "bahmni.common.domain", "ngDialog", "pascalprecht.translate", "ngCookies", "monospaced.elastic", "bahmni.common.displaycontrol.hint", "bahmni.common.attributeTypes", "bahmni.common.models", "bahmni.common.uicontrols", "bahmni.common.displaycontrol.diagnosis", "toaster"]).config(["$urlRouterProvider", "$stateProvider", "$httpProvider", "$bahmniTranslateProvider", "$compileProvider", function($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
    $httpProvider.defaults.headers.common["Disable-WWW-Authenticate"] = !0, $urlRouterProvider.otherwise("/search"), $compileProvider.debugInfoEnabled(!1), $stateProvider.state("search", {
        url: "/search",
        reloadOnSearch: !1,
        views: {
            layout: {
                templateUrl: "views/layout.html",
                controller: "SearchPatientController"
            },
            "content@search": {
                templateUrl: "views/search.html"
            }
        },
        resolve: {
            initialize: function(initialization) {
                return initialization()
            }
        }
    }).state("newpatient", {
        url: "/patient/new",
        views: {
            layout: {
                templateUrl: "views/layout.html",
                controller: "CreatePatientController"
            },
            "content@newpatient": {
                templateUrl: "views/newpatient.html"
            }
        },
        resolve: {
            initialize: function(initialization) {
                return initialization()
            }
        }
    }).state("patient", {
        url: "/patient/:patientUuid",
        "abstract": !0,
        views: {
            layout: {
                template: '<div ui-view="layout"></div>'
            }
        },
        resolve: {
            initialize: function(initialization) {
                return initialization()
            }
        }
    }).state("patient.edit", {
        url: "?serverError",
        views: {
            layout: {
                templateUrl: "views/layout.html",
                controller: "EditPatientController"
            },
            "content@patient.edit": {
                templateUrl: "views/editpatient.html"
            },
            "headerExtension@patient.edit": {
                template: "<div print-options></div>"
            }
        }
    }).state("patient.visit", {
        url: "/visit&coPayment=:copaymentValue",
        views: {
            layout: {
                templateUrl: "views/layout.html",
                controller: "VisitController"
            },
            "content@patient.visit": {
                templateUrl: "views/visit.html"
            },
            "headerExtension@patient.visit": {
                template: "<div print-options></div>"
            }
        }
    }).state("patient.printSticker", {
        url: "/printSticker",
        views: {
            layout: {
                templateUrl: "views/layout.html"
            },
            "content@patient.printSticker": {
                templateUrl: "views/notimplemented.html"
            }
        }
    }), $bahmniTranslateProvider.init({
        app: "registration",
        shouldMerge: !0
    })
}]).run(["$rootScope", "$templateCache", "$bahmniCookieStore", "locationService", "messagingService", "auditLogService", "$window", function($rootScope, $templateCache, $bahmniCookieStore, locationService, messagingService, auditLogService, $window) {
    var getStates = function(toState, fromState) {
        var states = [];
        return "newpatient" !== fromState || "patient.edit" !== toState && "patient.visit" !== toState || states.push("newpatient.save"), "patient.edit" === toState ? states.push("patient.view") : states.push(toState), states
    };
    moment.locale($window.localStorage.NG_TRANSLATE_LANG_KEY || "en");
    var loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid;
    locationService.getVisitLocation(loginLocationUuid).then(function(response) {
        response.data && ($rootScope.visitLocation = response.data.uuid)
    }), $rootScope.$on("$stateChangeStart", function() {
        messagingService.hideMessages("error")
    }), $rootScope.createAuditLog = function(event, toState, toParams, fromState) {
        var states = getStates(toState.name, fromState.name);
        states.forEach(function(state) {
            auditLogService.log(toParams.patientUuid, Bahmni.Registration.StateNameEvenTypeMap[state], void 0, "MODULE_LABEL_REGISTRATION_KEY")
        })
    }, $rootScope.$on("$stateChangeSuccess", $rootScope.createAuditLog)
}]), angular.module("bahmni.registration").factory("initialization", ["$rootScope", "$q", "configurations", "authenticator", "appService", "spinner", "preferences", "locationService", "mergeService", function($rootScope, $q, configurations, authenticator, appService, spinner, preferences, locationService, mergeService) {
    var getConfigs = function() {
            var configNames = ["encounterConfig", "patientAttributesConfig", "identifierTypesConfig", "addressLevels", "genderMap", "relationshipTypeConfig", "relationshipTypeMap", "loginLocationToVisitTypeMapping"];
            return configurations.load(configNames).then(function() {
                var mandatoryPersonAttributes = appService.getAppDescriptor().getConfigValue("mandatoryPersonAttributes"),
                    patientAttributeTypes = (new Bahmni.Common.Domain.AttributeTypeMapper).mapFromOpenmrsAttributeTypes(configurations.patientAttributesConfig(), mandatoryPersonAttributes);
                $rootScope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig, configurations.encounterConfig()), $rootScope.encounterConfig = angular.extend(new EncounterConfig, configurations.encounterConfig()), $rootScope.patientConfiguration = new Bahmni.Registration.PatientConfig(patientAttributeTypes.attributeTypes, configurations.identifierTypesConfig(), appService.getAppDescriptor().getConfigValue("patientInformation")), $rootScope.regEncounterConfiguration.loginLocationToVisitTypeMap = configurations.loginLocationToVisitTypeMapping(), $rootScope.addressLevels = configurations.addressLevels(), $rootScope.fieldValidation = appService.getAppDescriptor().getConfigValue("fieldValidation"), $rootScope.genderMap = configurations.genderMap(), $rootScope.relationshipTypeMap = configurations.relationshipTypeMap(), $rootScope.relationshipTypes = configurations.relationshipTypes()
            })
        },
        loadValidators = function(baseUrl, contextPath) {
            var script = baseUrl + contextPath + "/fieldValidation.js";
            Bahmni.Common.Util.DynamicResourceLoader.includeJs(script, !1)
        },
        initApp = function() {
            return appService.initApp("registration", {
                app: !0,
                extension: !0
            })
        },
        getIdentifierPrefix = function() {
            preferences.identifierPrefix = appService.getAppDescriptor().getConfigValue("defaultIdentifierPrefix")
        },
        initAppConfigs = function() {
            $rootScope.registration = $rootScope.registration || {}, getIdentifierPrefix()
        },
        mapRelationsTypeWithSearch = function() {
            var relationshipTypeMap = $rootScope.relationshipTypeMap || {};
            return relationshipTypeMap.provider ? void $rootScope.relationshipTypes.forEach(function(relationshipType) {
                relationshipType.searchType = relationshipTypeMap.provider.indexOf(relationshipType.aIsToB) > -1 ? "provider" : "patient"
            }) : "patient"
        },
        loggedInLocation = function() {
            return locationService.getLoggedInLocation().then(function(location) {
                $rootScope.loggedInLocation = location
            })
        },
        mergeFormConditions = function() {
            var formConditions = Bahmni.ConceptSet.FormConditions;
            formConditions && (formConditions.rules = mergeService.merge(formConditions.rules, formConditions.rulesOverride))
        },
        checkPrivilege = function() {
            return appService.checkPrivilege("app:registration")
        };
    return function() {
        return spinner.forPromise(authenticator.authenticateUser().then(initApp).then(checkPrivilege).then(getConfigs).then(initAppConfigs).then(mapRelationsTypeWithSearch).then(loggedInLocation).then(loadValidators(appService.configBaseUrl(), "registration")).then(mergeFormConditions))
    }
}]);
var defaults = {
        maxAutocompleteResults: 20
    },
    Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
var hostUrl = Bahmni.Common.Constants.hostURL,
    RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";
Bahmni.Registration.Constants = {
    openmrsUrl: hostUrl + "/openmrs",
    registrationEncounterType: "REG",
    baseOpenMRSRESTURL: RESTWS_V1,
    patientImageUrlByPatientUuid: RESTWS_V1 + "/patientImage?patientUuid=",
    bahmniRESTBaseURL: hostUrl + "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: hostUrl + "/openmrs/ws/rest/emrapi",
    emrApiEncounterUrl: hostUrl + "/openmrs/ws/rest/emrapi/encounter",
    webServiceRestBaseURL: hostUrl + "/openmrs/ws/rest/v1",
    patientSearchURL: "/search",
    allAddressFileds: ["uuid", "preferred", "address1", "address2", "address3", "address4", "address5", "address6", "cityVillage", "countyDistrict", "stateProvince", "postalCode", "country", "latitude", "longitude"],
    nextStepConfigId: "org.bahmni.registration.patient.next"
}, Bahmni.Registration.Constants.Errors = {
    manageIdentifierSequencePrivilege: "You don't have the privilege to create a patient with the given ID."
}, angular.module("bahmni.common.patient").directive("fallbackSrc", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            _.isEmpty(attrs.ngSrc) && element.attr("src", attrs.fallbackSrc), element.bind("error", function() {
                element.attr("src", attrs.fallbackSrc)
            })
        }
    }
}), angular.module("bahmni.registration").directive("addressFields", function() {
    return {
        restrict: "AE",
        templateUrl: " views/addressFields.html",
        controller: "AddressFieldsDirectiveController",
        scope: {
            address: "=",
            addressLevels: "=",
            fieldValidation: "=",
            strictAutocompleteFromLevel: "="
        }
    }
}).controller("AddressFieldsDirectiveController", ["$scope", "addressHierarchyService", function($scope, addressHierarchyService) {
    var addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse();
    $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelsCloneInDescendingOrder, 2);
    var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function(addressLevel) {
        return addressLevel.addressField
    });
    $scope.addressFieldSelected = function(fieldName) {
        return function(addressFieldItem) {
            var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
            $scope.selectedValue[fieldName] = addressFieldItem.addressField.name;
            var parent = addressFieldItem.addressField.parent;
            parentFields.forEach(function(parentField) {
                parent && ($scope.address[parentField] = parent.name, $scope.selectedValue[parentField] = parent.name, parent = parent.parent)
            })
        }
    }, $scope.removeAutoCompleteEntry = function(fieldName) {
        var address1Field = document.getElementById("address1");
        var districtField = document.getElementById("countyDistrict");
        var countryField = document.getElementById("cityVillage");
        var countriesField = document.getElementById("country");
        var address1ID = document.querySelector('label[for="address1"]');
        var countryID = document.querySelector('label[for="cityVillage"]');
        var countyDistrictID = document.querySelector('label[for="countyDistrict"]');
        if (address1Field && countryField) {
            countryID.style.position = "absolute";
            countryID.style.marginLeft = "636px";
            countryID.style.marginTop = "-58px";
            countyDistrictID.style.position = "absolute";
            countyDistrictID.style.marginLeft = "634px";
            countyDistrictID.style.marginTop = "-23px";
            countryField.style.position = "absolute";
            countryField.style.marginLeft = "883px";
            countryField.style.marginTop = "-59px";
            address1ID.style.position = "absolute";
            address1ID.style.marginLeft = "-634px";
            address1ID.style.marginTop = "44px";
            address1Field.style.position = "static";
            address1Field.style.marginLeft = "-386px";
            address1Field.style.marginTop = "39px";
            districtField.style.position = "absolute";
            districtField.style.marginLeft = "884px";
            districtField.style.marginTop = "-26px"
        } else {
            console.error("Element with ID 'address1' not found.")
        }
        var address2Input = document.getElementById("address2");
        var vdcInput = document.getElementById("cityVillage");
        var address1Input = document.getElementById("address1");
        var casteInput = document.getElementById("Caste");
        if (address2Input) {
            address2Input.addEventListener("keydown", function(event) {
                if (event.keyCode === 9) {
                    event.preventDefault();
                    vdcInput.focus()
                }
            })
        }
        if (vdcInput) {
            vdcInput.addEventListener("keydown", function(event) {
                if (event.keyCode === 9) {
                    event.preventDefault();
                    address1Input.focus()
                }
            })
        }



        return function() {
            $scope.selectedValue[fieldName] = null
        }
    }, $scope.getAddressEntryList = function(field) {
        return function(searchAttrs) {
            return addressHierarchyService.search(field, searchAttrs.term)
        }
    }, $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults, $scope.clearFields = function(fieldName) {
        var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
        childFields.forEach(function(childField) {
            _.isEmpty($scope.selectedValue[childField]) || ($scope.address[childField] = null, $scope.selectedValue[childField] = null)
        })
    };
    var init = function() {
        $scope.addressLevels.reverse();
        var isStrictEntry = !1;
        _.each($scope.addressLevels, function(addressLevel) {
            addressLevel.isStrictEntry = $scope.strictAutocompleteFromLevel == addressLevel.addressField || isStrictEntry, isStrictEntry = addressLevel.isStrictEntry
        }), $scope.addressLevels.reverse();
        var addressWatch = $scope.$watch("address", function(newValue) {
            void 0 !== newValue && ($scope.selectedValue = _.mapValues($scope.address, function(value, key) {
                var addressLevel = _.find($scope.addressLevels, {
                    addressField: key
                });
                return addressLevel && addressLevel.isStrictEntry ? value : null
            }), addressWatch())
        })
    };
    init()
}]), angular.module("bahmni.registration").directive("topDownAddressFields", function() {
    return {
        restrict: "AE",
        templateUrl: "views/topDownAddressFields.html",
        controller: "TopDownAddressFieldsDirectiveController",
        scope: {
            address: "=",
            addressLevels: "=",
            fieldValidation: "=",
            strictAutocompleteFromLevel: "="
        }
    }
}).controller("TopDownAddressFieldsDirectiveController", ["$scope", "addressHierarchyService", function($scope, addressHierarchyService) {
    $scope.addressFieldInvalid = !1;
    var selectedAddressUuids = {},
        selectedUserGeneratedIds = {},
        addressLevelsCloneInDescendingOrder = $scope.addressLevels.slice(0).reverse(),
        addressLevelUIOrderBasedOnConfig = $scope.addressLevels;
    $scope.addressLevelsChunks = Bahmni.Common.Util.ArrayUtil.chunk(addressLevelUIOrderBasedOnConfig, 2);
    var addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(function(addressLevel) {
            return addressLevel.addressField
        }),
        populateSelectedAddressUuids = function(levelIndex, parentUuid) {
            if (0 !== $scope.addressLevels.length && $scope.addressLevels[levelIndex]) {
                var fieldName = $scope.addressLevels[levelIndex].addressField,
                    addressValue = $scope.address[fieldName];
                addressValue && addressHierarchyService.search(fieldName, addressValue, parentUuid).then(function(response) {
                    var address = response && response.data && response.data[0];
                    address && (selectedAddressUuids[fieldName] = address.uuid, selectedUserGeneratedIds[fieldName] = address.userGeneratedId, populateSelectedAddressUuids(levelIndex + 1, address.uuid))
                })
            }
        };
    $scope.addressFieldSelected = function(fieldName) {
        return function(addressFieldItem) {
            selectedAddressUuids[fieldName] = addressFieldItem.addressField.uuid, selectedUserGeneratedIds[fieldName] = addressFieldItem.addressField.userGeneratedId, $scope.selectedValue[fieldName] = addressFieldItem.addressField.name;
            var parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1),
                parent = addressFieldItem.addressField.parent;
            parentFields.forEach(function(parentField) {
                parent && ($scope.address[parentField] = parent.name, $scope.selectedValue[parentField] = parent.name, parent = parent.parent)
            })
        }
    }, $scope.findParentField = function(fieldName) {
        var parentFieldName, found = _.find($scope.addressLevels, {
                addressField: fieldName
            }),
            index = _.findIndex($scope.addressLevels, found),
            topLevel = 0;
        if (index !== topLevel) {
            var parent = $scope.addressLevels[index - 1];
            parentFieldName = parent.addressField
        }
        return parentFieldName
    }, $scope.isReadOnly = function(addressLevel) {
        if (!$scope.address) return !1;
        if (!addressLevel.isStrictEntry) return !1;
        var fieldName = addressLevel.addressField,
            parentFieldName = $scope.findParentField(fieldName),
            parentValue = $scope.address[parentFieldName],
            parentValueInvalid = isParentValueInvalid(parentFieldName);
        return !!parentFieldName && (!(!parentFieldName || parentValue) || parentFieldName && parentValue && parentValueInvalid)
    };
    var isParentValueInvalid = function(parentId) {
            return angular.element($("#" + parentId)).hasClass("illegalValue")
        },
        parentUuid = function(field) {
            return selectedAddressUuids[$scope.findParentField(field)]
        };
    $scope.getAddressEntryList = function(field) {
        return function(searchAttrs) {
            return addressHierarchyService.search(field, searchAttrs.term, parentUuid(field))
        }
    }, $scope.getAddressDataResults = addressHierarchyService.getAddressDataResults, $scope.clearFields = function(fieldName) {
        var childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
        childFields.forEach(function(childField) {
            null !== $scope.selectedValue[childField] && ($scope.address[childField] = null, $scope.selectedValue[childField] = null, selectedAddressUuids[childField] = null, selectedUserGeneratedIds[childField] = null)
        }), _.isEmpty($scope.address[fieldName]) && ($scope.address[fieldName] = null, selectedUserGeneratedIds[fieldName] = null)
    }, $scope.removeAutoCompleteEntry = function(fieldName) {
        return function() {
            $scope.selectedValue[fieldName] = null
        }
    };
    var init = function() {
        $scope.addressLevels.reverse();
        var isStrictEntry = !1;
        _.each($scope.addressLevels, function(addressLevel) {
            addressLevel.isStrictEntry = $scope.strictAutocompleteFromLevel == addressLevel.addressField || isStrictEntry, isStrictEntry = addressLevel.isStrictEntry
        }), $scope.addressLevels.reverse();
        var deregisterAddressWatch = $scope.$watch("address", function(newValue) {
            void 0 !== newValue && (populateSelectedAddressUuids(0), $scope.selectedValue = _.mapValues($scope.address, function(value, key) {
                var addressLevel = _.find($scope.addressLevels, {
                    addressField: key
                });
                return addressLevel && addressLevel.isStrictEntry ? value : null
            }), deregisterAddressWatch())
        })
    };
    init()
}]), angular.module("bahmni.registration").directive("printOptions", ["$rootScope", "registrationCardPrinter", "spinner", "appService", "$filter", "visitService", function($rootScope, registrationCardPrinter, spinner, appService, $filter) {
    var controller = function($scope) {
        $scope.printOptions = appService.getAppDescriptor().getConfigValue("printOptions"), $scope.defaultPrint = $scope.printOptions && $scope.printOptions[0];
        var mapRegistrationObservations = function() {
            var obs = {};
            $scope.observations = $scope.observations || [];
            var getValue = function(observation) {
                obs[observation.concept.name] = obs[observation.concept.name] || [], observation.value && obs[observation.concept.name].push(observation.value), observation.groupMembers.forEach(getValue)
            };
            return $scope.observations.forEach(getValue), obs
        };
        $scope.print = function(option) {
            return registrationCardPrinter.print(option.templateUrl, $scope.patient, $scope.visitTypePrice, $scope.coPayment, mapRegistrationObservations(), $scope.encounterDateTime)
        }, $scope.buttonText = function(option, type) {
            var printHtml = "",
                optionValue = option && $filter("titleTranslate")(option);
            return type && (printHtml = '<i class="fa fa-print"></i>'), "<span>" + optionValue + "</span>" + printHtml
        }
    };
    return {
        restrict: "A",
        templateUrl: "views/printOptions.html",
        controller: controller
    }
}]), angular.module("bahmni.registration").directive("patientRelationship", function() {
    return {
        restrict: "AE",
        templateUrl: "views/patientRelationships.html",
        controller: "PatientRelationshipController",
        scope: {
            patient: "="
        }
    }
}).controller("PatientRelationshipController", ["$window", "$scope", "$rootScope", "spinner", "patientService", "providerService", "appService", "$q", function($window, $scope, $rootScope, spinner, patientService, providerService, appService, $q) {
    var receivedData = patientService.getData();
    patientService.clearData();
    var nhisNumbers = $rootScope.nhisNumber;
    // if (receivedData != null) {
    //     var copaymentStatus = receivedData.copaymentStatusValue;
    //     if (copaymentStatus == 0) {
    //         document.getElementById("NHIS Member").value = "string:d74b4da5-bdee-4650-8e31-986f27e0d23c";
    //         if (nhisNumbers !== null) {
    //             document.getElementById("NHIS Primary Contact Point").value = "string:7b2d6deb-d3b4-464c-8dbb-4b6e35d85ad9"
    //         } else {
    //             document.getElementById("NHIS Primary Contact Point").value = "string:d74b4da5-bdee-4650-8e31-986f27e0d23c"
    //         }
    //     } else if (copaymentStatus == 1) {
    //         document.getElementById("NHIS Member").value = "string:7b2d6deb-d3b4-464c-8dbb-4b6e35d85ad9";
    //         document.getElementById("NHIS Primary Contact Point").value = "string:7b2d6deb-d3b4-464c-8dbb-4b6e35d85ad9"
    //     }
    // }
    try {
        var birth = receivedData.dob.split("-");
        var nepaliDateEng = calendarFunctions.getBsDateByAdDate(parseInt(birth[0]), parseInt(birth[1]), parseInt(birth[2]));
        var nepali_date = calendarFunctions.getNepaliNumber(nepaliDateEng.bsYear) + "-" + calendarFunctions.getNepaliNumber(nepaliDateEng.bsMonth) + "-" + calendarFunctions.getNepaliNumber(nepaliDateEng.bsDate);
        var currentDate = new Date;
        var dob = new Date(receivedData.dob);
        var ageInMilliseconds = currentDate - dob;
        var years = Math.floor(ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1e3));
        var months = Math.floor(ageInMilliseconds % (365.25 * 24 * 60 * 60 * 1e3) / (30.44 * 24 * 60 * 60 * 1e3));
        var days = Math.floor(ageInMilliseconds % (30.44 * 24 * 60 * 60 * 1e3) / (24 * 60 * 60 * 1e3))
    } catch (exception) {}
    if (givenName.value) {
        if (nhisNumbers) {
            $scope.patient["NHIS Number"] = nhisNumbers
        }
        $scope.patient["NHIS Number"] = $scope.patient["NHIS Number"]
    } else if (familyName != "") {
        if (receivedData) {
            $scope.patient["NHIS Number"] = receivedData.nhis;
            Object.assign($scope.patient, {
                givenName: receivedData.fname,
                middleName: receivedData.middle_name,
                familyName: receivedData.last_name,
                "Contact Number": receivedData.phone,
                age: {
                    years: years,
                    months: months,
                    days: days
                },
                birthdateBS: nepali_date,
                gender: receivedData.gender ? receivedData.gender[0].toUpperCase() : ""
            })
        } else if (nhisNumbers) {
            $scope.patient["NHIS Number"] = nhisNumbers
        }
    }
    
    
    
    
    $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.enableNepaliCalendar = appService.getAppDescriptor().getConfigValue("enableNepaliCalendar"), $scope.addPlaceholderRelationship = function() {
        $scope.patient.newlyAddedRelationships.push({})
    }, $scope.removeRelationship = function(relationship, index) {
        relationship.uuid ? (relationship.voided = !0, $scope.patient.deletedRelationships.push(relationship)) : $scope.patient.newlyAddedRelationships.splice(index, 1)
    }, $scope.isPatientRelationship = function(relationship) {
        var relationshipType = getRelationshipType(relationship);
        return relationshipType && (_.isUndefined(relationshipType.searchType) || "patient" === relationshipType.searchType)
    };
    var getRelationshipType = function(relationship) {
        return !angular.isUndefined(relationship.relationshipType) && $scope.getRelationshipType(relationship.relationshipType.uuid)
    };
    $scope.getChosenRelationshipType = function(relation) {
        return $scope.isPatientRelationship(relation) ? "patient" : $scope.isProviderRelationship(relation) ? "provider" : void 0
    }, $scope.isProviderRelationship = function(relationship) {
        var relationshipType = getRelationshipType(relationship);
        return relationshipType && "provider" === relationshipType.searchType
    }, $scope.getRelationshipType = function(uuid) {
        return _.find($scope.relationshipTypes, {
            uuid: uuid
        })
    }, $scope.getRelationshipTypeForDisplay = function(relationship) {
        var personUuid = $scope.patient.uuid,
            relationshipType = $scope.getRelationshipType(relationship.relationshipType.uuid);
        return relationship.personA ? relationship.personA.uuid === personUuid ? relationshipType.aIsToB : relationshipType.bIsToA : ""
    }, $scope.getRelatedToPersonForDisplay = function(relationship) {
        var personRelatedTo = getPersonRelatedTo(relationship);
        return personRelatedTo ? personRelatedTo.display : ""
    };
    var getName = function(patient) {
            return patient.givenName + (patient.middleName ? " " + patient.middleName : "") + (patient.familyName ? " " + patient.familyName : "")
        },
        getPersonB = function(personName, personUuid) {
            return {
                display: personName,
                uuid: personUuid
            }
        };
    $scope.searchByPatientIdentifier = function(relationship) {
        return relationship.patientIdentifier ? (relationship.hasOwnProperty("personB") && (relationship.personB = null), patientService.searchByIdentifier(relationship.patientIdentifier).then(function(response) {
            if (!angular.isUndefined(response)) {
                var patients = response.data.pageOfResults;
                if (0 !== patients.length) {
                    relationship.content = getPatientGenderAndAge(patients[0]);
                    var personUuid = patients[0].uuid,
                        personName = getName(patients[0]);
                    relationship.personB = getPersonB(personName, personUuid)
                }
            }
        })) : (relationship.personB = null, void(relationship.content = null))
    }, $scope.showPersonNotFound = function(relationship) {
        return relationship.patientIdentifier && !relationship.personB && "patient" !== $scope.getChosenRelationshipType(relationship)
    }, $scope.isInvalidRelation = function(relation) {
        return _.isEmpty(_.get(relation, "personB.uuid")) || $scope.duplicateRelationship(relation)
    }, $scope.duplicateRelationship = function(relationship) {
        if (_.isEmpty(relationship.relationshipType) || _.isEmpty(relationship.personB)) return !1;
        var existingRelatives = getAlreadyAddedRelationshipPersonUuid($scope.patient, relationship.relationshipType.uuid);
        return _.get(_.countBy(existingRelatives, _.identity), relationship.personB.uuid, 0) > 1
    };
    var getPersonRelatedTo = function(relationship) {
        return relationship.personA && relationship.personA.uuid === $scope.patient.uuid ? relationship.personB : relationship.personA
    };
    $scope.openPatientDashboardInNewTab = function(relationship) {
        var personRelatedTo = getPersonRelatedTo(relationship);
        $window.open(getPatientRegistrationUrl(personRelatedTo.uuid), "_blank")
    };
    var getPatientRegistrationUrl = function(patientUuid) {
        return "#/patient/" + patientUuid
    };
    $scope.getProviderList = function() {
        return function(searchAttrs) {
            return providerService.search(searchAttrs.term)
        }
    }, $scope.providerSelected = function(relationship) {
        return function(providerData) {
            relationship.providerName = providerData.identifier, relationship.personB = getPersonB(providerData.identifier, providerData.uuid)
        }
    };
    var clearPersonB = function(relationship, fieldName) {
            relationship[fieldName] || delete relationship.personB
        },
        getDeletedRelationshipUuids = function(patient, relationTypeUuid) {
            return getPersonUuidsForRelationship(patient.deletedRelationships, relationTypeUuid)
        },
        getNewlyAddedRelationshipPersonUuid = function(patient, relationTypeUuid) {
            return getPersonUuidsForRelationship(patient.newlyAddedRelationships, relationTypeUuid)
        },
        getPersonUuidsForRelationship = function(relationships, relationshipTypeUuid) {
            var uuids = [];
            return _.each(relationships, function(relationship) {
                relationship.personB && relationship.relationshipType.uuid === relationshipTypeUuid && uuids.push(relationship.personB.uuid)
            }), uuids
        },
        getAlreadyAddedRelationshipPersonUuid = function(patient, relationTypeUuid) {
            var personUuids = _.concat(getPersonUuidsForRelationship(patient.relationships, relationTypeUuid), getNewlyAddedRelationshipPersonUuid(patient, relationTypeUuid));
            return _.difference(personUuids, getDeletedRelationshipUuids(patient, relationTypeUuid))
        };
    $scope.clearProvider = function(relationship) {
        clearPersonB(relationship, "providerName")
    };
    var getLimit = function(configName, defaultValue) {
        return appService.getAppDescriptor().getConfigValue(configName) || defaultValue
    };
    $scope.searchByPatientIdentifierOrName = function(searchAttrs) {
        var term = searchAttrs.term;
        return term && term.length >= getLimit("minCharRequireToSearch", 1) ? patientService.searchByNameOrIdentifier(term, getLimit("possibleRelativeSearchLimit", Bahmni.Common.Constants.defaultPossibleRelativeSearchLimit)) : $q.when()
    }, $scope.clearPatient = function(relationship) {
        clearPersonB(relationship, "patientIdentifier")
    }, $scope.patientSelected = function(relationship) {
        return function(patientData) {
            relationship.patientIdentifier = patientData.identifier, relationship.personB = getPersonB(patientData.value, patientData.uuid)
        }
    }, $scope.getPatientList = function(response) {
        if (!angular.isUndefined(response)) return response.data.pageOfResults.map(function(patient) {
            return {
                value: getName(patient) + " - " + patient.identifier,
                uuid: patient.uuid,
                identifier: patient.identifier
            }
        })
    }, $scope.getProviderDataResults = function(data) {
        return data.data.results.filter(function(provider) {
            return provider.person
        }).map(function(providerDetails) {
            return {
                value: providerDetails.display || providerDetails.person.display,
                uuid: providerDetails.person.uuid,
                identifier: providerDetails.identifier || providerDetails.person.display
            }
        })
    }, $scope.onEdit = function(relationship) {
        return function() {
            delete relationship.personB
        }
    }, $scope.clearRelationshipRow = function(relationship, index) {
        delete relationship.personB, delete relationship.patientIdentifier, delete relationship.providerName, delete relationship.endDate, delete relationship.content, managePlaceholderRelationshipRows(index)
    };
    var managePlaceholderRelationshipRows = function(index) {
        var iter;
        for (iter = 0; iter < $scope.patient.newlyAddedRelationships.length; iter++) $scope.isEmpty($scope.patient.newlyAddedRelationships[iter]) && iter !== index && $scope.patient.newlyAddedRelationships.splice(iter, 1);
        var emptyRows = _.filter($scope.patient.newlyAddedRelationships, $scope.isEmpty);
        0 === emptyRows.length && $scope.addPlaceholderRelationship()
    };
    $scope.isEmpty = function(relationship) {
        return !relationship.relationshipType || !relationship.relationshipType.uuid
    };
    var getPatientGenderAndAge = function(patient) {
            var patientGenderAndAge = [patient.givenName, patient.age, $rootScope.genderMap[angular.uppercase(patient.gender)]];
            return patientGenderAndAge.join(", ")
        },
        init = function() {
            $scope.relationshipTypes = $rootScope.relationshipTypes, $scope.patient.relationships = $scope.patient.relationships || []
        };
    $scope.updateRelationshipDate = function(newRelationship) {
        if (newRelationship.endDateBS) {
            var dateStr = newRelationship.endDateBS.split("-"),
                relationshipEndDateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
            newRelationship.endDate = relationshipEndDateAD
        }
    }, init()
}]), angular.module("bahmni.registration").controller("NavigationController", ["$scope", "$rootScope", "$location", "sessionService", "$window", "appService", "$sce", function($scope, $rootScope, $location, sessionService, $window, appService, $sce) {
    $scope.extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.navigation", "link"), $scope.goTo = function(url) {
        $location.url(url)
    }, $scope.htmlLabel = function(label) {
        return $sce.trustAsHtml(label)
    }, $scope.logout = function() {
        $rootScope.errorMessage = null, sessionService.destroy().then(function() {
            $window.location = "../home/"
        })
    }, $scope.sync = function() {}
}]), angular.module("bahmni.registration").controller("SearchPatientController", ["$rootScope", "$scope", "$location", "$window", "spinner", "patientService", "appService", "messagingService", "$translate", "$filter", function($rootScope, $scope, $location, $window, spinner, patientService, appService, messagingService, $translate, $filter) {
    $scope.results = [], $scope.extraIdentifierTypes = _.filter($rootScope.patientConfiguration.identifierTypes, function(identifierType) {
        return !identifierType.primary
    });
    var searching = !1,
        maxAttributesFromConfig = 5,
        allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {},
        patientSearchResultConfigs = appService.getAppDescriptor().getConfigValue("patientSearchResults") || {};
    maxAttributesFromConfig = _.isEmpty(allSearchConfigs.programAttributes) ? maxAttributesFromConfig : maxAttributesFromConfig - 1, $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.getAddressColumnName = function(column) {
        var columnName = "",
            columnCamelCase = column.replace(/([-_][a-z])/g, function($1) {
                return $1.toUpperCase().replace(/[-_]/, "")
            });
        return _.each($scope.addressLevels, function(addressLevel) {
            addressLevel.addressField === columnCamelCase && (columnName = addressLevel.name)
        }), columnName
    };
    var hasSearchParameters = function() {
            return $scope.searchParameters.name.trim().length > 0 || $scope.searchParameters.addressFieldValue.trim().length > 0 || $scope.searchParameters.customAttribute.trim().length > 0 || $scope.searchParameters.programAttributeFieldValue.trim().length > 0
        },
        searchBasedOnQueryParameters = function(offset) {
            if (!isUserPrivilegedForSearch()) return void showInsufficientPrivMessage();
            var searchParameters = $location.search();
            if ($scope.searchParameters.addressFieldValue = searchParameters.addressFieldValue || "", $scope.searchParameters.name = searchParameters.name || "", $scope.searchParameters.customAttribute = searchParameters.customAttribute || "", $scope.searchParameters.programAttributeFieldValue = searchParameters.programAttributeFieldValue || "", $scope.searchParameters.addressSearchResultsConfig = searchParameters.addressSearchResultsConfig || "", $scope.searchParameters.personSearchResultsConfig = searchParameters.personSearchResultsConfig || "", $scope.searchParameters.registrationNumber = searchParameters.registrationNumber || "", hasSearchParameters()) {
                searching = !0;
                var searchPromise = patientService.search($scope.searchParameters.name, void 0, $scope.addressSearchConfig.field, $scope.searchParameters.addressFieldValue, $scope.searchParameters.customAttribute, offset, $scope.customAttributesSearchConfig.fields, $scope.programAttributesSearchConfig.field, $scope.searchParameters.programAttributeFieldValue, $scope.addressSearchResultsConfig.fields, $scope.personSearchResultsConfig.fields).then(function(response) {
                    return mapExtraIdentifiers(response), mapCustomAttributesSearchResults(response), mapAddressAttributesSearchResults(response), mapProgramAttributesSearchResults(response), response
                });
                return searchPromise["finally"](function() {
                    searching = !1
                }), searchPromise
            }
        };
    $scope.convertToTableHeader = function(camelCasedText) {
        return camelCasedText.replace(/[A-Z]|^[a-z]/g, function(str) {
            return " " + str.toUpperCase()
        }).trim()
    }, $scope.getProgramAttributeValues = function(result) {
        var attributeValues = result && result.patientProgramAttributeValue && result.patientProgramAttributeValue[$scope.programAttributesSearchConfig.field],
            commaSeparatedAttributeValues = "";
        return _.each(attributeValues, function(attr) {
            commaSeparatedAttributeValues = commaSeparatedAttributeValues + attr + ", "
        }), commaSeparatedAttributeValues.substring(0, commaSeparatedAttributeValues.length - 2)
    };
    var mapExtraIdentifiers = function(data) {
            "Searching" !== data && _.each(data.pageOfResults, function(result) {
                result.extraIdentifiers = result.extraIdentifiers && JSON.parse(result.extraIdentifiers)
            })
        },
        mapCustomAttributesSearchResults = function(data) {
            $scope.personSearchResultsConfig.fields && "Searching" !== data && _.map(data.pageOfResults, function(result) {
                result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute)
            })
        },
        mapAddressAttributesSearchResults = function(data) {
            $scope.addressSearchResultsConfig.fields && "Searching" !== data && _.map(data.pageOfResults, function(result) {
                try {
                    result.addressFieldValue = JSON.parse(result.addressFieldValue)
                } catch (e) {}
            })
        },
        mapProgramAttributesSearchResults = function(data) {
            $scope.programAttributesSearchConfig.field && "Searching" !== data && _.map(data.pageOfResults, function(result) {
                var programAttributesObj = {},
                    arrayOfStringOfKeysValue = result.patientProgramAttributeValue && result.patientProgramAttributeValue.substring(2, result.patientProgramAttributeValue.length - 2).split('","');
                _.each(arrayOfStringOfKeysValue, function(keyValueString) {
                    var keyValueArray = keyValueString.split('":"'),
                        key = keyValueArray[0],
                        value = keyValueArray[1];
                    _.includes(_.keys(programAttributesObj), key) ? programAttributesObj[key].push(value) : (programAttributesObj[key] = [], programAttributesObj[key].push(value))
                }), result.patientProgramAttributeValue = programAttributesObj
            })
        },
        showSearchResults = function(searchPromise) {
            $scope.noMoreResultsPresent = !1, searchPromise && searchPromise.then(function(data) {
                $scope.results = data.pageOfResults, $scope.noResultsMessage = 0 === $scope.results.length ? "REGISTRATION_NO_RESULTS_FOUND" : null
            })
        },
        setPatientIdentifierSearchConfig = function() {
            $scope.patientIdentifierSearchConfig = {}, $scope.patientIdentifierSearchConfig.show = void 0 === allSearchConfigs.searchByPatientIdentifier || allSearchConfigs.searchByPatientIdentifier
        },
        setAddressSearchConfig = function() {
            if ($scope.addressSearchConfig = allSearchConfigs.address || {}, $scope.addressSearchConfig.show = !_.isEmpty($scope.addressSearchConfig) && !_.isEmpty($scope.addressSearchConfig.field), $scope.addressSearchConfig.label && !$scope.addressSearchConfig.label) throw new Error("Search Config label is not present!");
            if ($scope.addressSearchConfig.field && !$scope.addressSearchConfig.field) throw new Error("Search Config field is not present!")
        },
        setCustomAttributesSearchConfig = function() {
            var customAttributesSearchConfig = allSearchConfigs.customAttributes;
            $scope.customAttributesSearchConfig = customAttributesSearchConfig || {}, $scope.customAttributesSearchConfig.show = !_.isEmpty(customAttributesSearchConfig) && !_.isEmpty(customAttributesSearchConfig.fields)
        },
        setProgramAttributesSearchConfig = function() {
            $scope.programAttributesSearchConfig = allSearchConfigs.programAttributes || {}, $scope.programAttributesSearchConfig.show = !_.isEmpty($scope.programAttributesSearchConfig.field)
        },
        sliceExtraColumns = function() {
            var orderedColumns = Object.keys(patientSearchResultConfigs);
            _.each(orderedColumns, function(column) {
                patientSearchResultConfigs[column].fields && !_.isEmpty(patientSearchResultConfigs[column].fields) && (patientSearchResultConfigs[column].fields = patientSearchResultConfigs[column].fields.slice(patientSearchResultConfigs[column].fields, maxAttributesFromConfig), maxAttributesFromConfig -= patientSearchResultConfigs[column].fields.length)
            })
        },
        setSearchResultsConfig = function() {
            var resultsConfigNotFound = !1;
            _.isEmpty(patientSearchResultConfigs) ? (resultsConfigNotFound = !0, patientSearchResultConfigs.address = {
                fields: allSearchConfigs.address ? [allSearchConfigs.address.field] : {}
            }, patientSearchResultConfigs.personAttributes = {
                fields: allSearchConfigs.customAttributes ? allSearchConfigs.customAttributes.fields : {}
            }) : (patientSearchResultConfigs.address || (patientSearchResultConfigs.address = {}), patientSearchResultConfigs.personAttributes || (patientSearchResultConfigs.personAttributes = {})), patientSearchResultConfigs.address.fields && !_.isEmpty(patientSearchResultConfigs.address.fields) && (patientSearchResultConfigs.address.fields = patientSearchResultConfigs.address.fields.filter(function(item) {
                return !_.isEmpty($scope.getAddressColumnName(item))
            })), resultsConfigNotFound || sliceExtraColumns(), $scope.personSearchResultsConfig = patientSearchResultConfigs.personAttributes, $scope.addressSearchResultsConfig = patientSearchResultConfigs.address
        },
        initialize = function() {
            $scope.searchParameters = {}, $scope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action"), setPatientIdentifierSearchConfig(), setAddressSearchConfig(), setCustomAttributesSearchConfig(), setProgramAttributesSearchConfig(), setSearchResultsConfig()
        },
        identifyParams = function(querystring) {
            querystring = querystring.substring(querystring.indexOf("?") + 1).split("&");
            for (var pair, params = {}, d = decodeURIComponent, i = querystring.length - 1; i >= 0; i--) pair = querystring[i].split("="), params[d(pair[0])] = d(pair[1]);
            return params
        };
    initialize(), $scope.disableSearchButton = function() {
        return !($scope.searchParameters.name || $scope.searchParameters.addressFieldValue || $scope.searchParameters.customAttribute || $scope.searchParameters.programAttributeFieldValue)
    }, $scope.$watch(function() {
        return $location.search()
    }, function() {
        showSearchResults(searchBasedOnQueryParameters(0))
    }), $scope.searchById = function() {
        if (!isUserPrivilegedForSearch()) return void showInsufficientPrivMessage();
        if ($scope.searchParameters.registrationNumber) {
            $scope.results = [];
            var patientIdentifier = $scope.searchParameters.registrationNumber;
            $location.search({
                registrationNumber: $scope.searchParameters.registrationNumber,
                programAttributeFieldName: $scope.programAttributesSearchConfig.field,
                patientAttributes: $scope.customAttributesSearchConfig.fields,
                programAttributeFieldValue: $scope.searchParameters.programAttributeFieldValue,
                addressSearchResultsConfig: $scope.addressSearchResultsConfig.fields,
                personSearchResultsConfig: $scope.personSearchResultsConfig.fields
            });
            var searchPromise = patientService.search(void 0, patientIdentifier, $scope.addressSearchConfig.field, void 0, void 0, void 0, $scope.customAttributesSearchConfig.fields, $scope.programAttributesSearchConfig.field, $scope.searchParameters.programAttributeFieldValue, $scope.addressSearchResultsConfig.fields, $scope.personSearchResultsConfig.fields, $scope.isExtraIdentifierConfigured()).then(function(data) {
                if (mapExtraIdentifiers(data), mapCustomAttributesSearchResults(data), mapAddressAttributesSearchResults(data), mapProgramAttributesSearchResults(data), 1 === data.pageOfResults.length) {
                    var patient = data.pageOfResults[0],
                        forwardUrl = appService.getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                    $location.url(appService.getAppDescriptor().formatUrl(forwardUrl, {
                        patientUuid: patient.uuid
                    }))
                } else data.pageOfResults.length > 1 ? ($scope.results = data.pageOfResults, $scope.noResultsMessage = null) : ($scope.patientIdentifier = {
                    patientIdentifier: patientIdentifier
                }, $scope.noResultsMessage = "REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT")
            });
            spinner.forPromise(searchPromise)
        }
    };
    var isUserPrivilegedForSearch = function() {
            var applicablePrivs = [Bahmni.Common.Constants.viewPatientsPrivilege, Bahmni.Common.Constants.editPatientsPrivilege, Bahmni.Common.Constants.addVisitsPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege],
                userPrivs = _.map($rootScope.currentUser.privileges, function(privilege) {
                    return privilege.name
                }),
                result = _.some(userPrivs, function(privName) {
                    return _.includes(applicablePrivs, privName)
                });
            return result
        },
        showInsufficientPrivMessage = function() {
            var message = $translate.instant("REGISTRATION_INSUFFICIENT_PRIVILEGE");
            messagingService.showMessage("error", message)
        };
    $scope.loadingMoreResults = function() {
        return searching && !$scope.noMoreResultsPresent
    }, $scope.showNewLoader = function () {
        document.getElementById("backgroundLoader").style.display = "block";
    },$scope.hideNewLoader = function () {
        document.getElementById("backgroundLoader").style.display = "none";
    }, 
     $scope.checkInIMIS = function () {
        if ($scope.searchParameters.customAttribute == "") {
            alert("Please enter the NHIS Number")
        } else {
            // Show the new loader while waiting for the API response
           $scope.showNewLoader();
           try{
            var xmlhttp = new XMLHttpRequest;
            var theUrl = "/insurance/Patient.php?identifier=" + $scope.searchParameters.customAttribute;
            xmlhttp.open("GET", theUrl);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlhttp.onload = function (e) {
                if(this.status == 200){
                    var data = JSON.parse(this.responseText);
                    var birthdate = data.entry[0].resource.birthDate;
                    var first_name = data.entry[0].resource.name[0].given[0];
                    var gender = data.entry[0].resource.gender;
                    var phone = data.entry[0].resource.telecom[0].value;
                    var nhsuuid = data.entry[0].resource.id;
                    var municipality = data.entry[0].resource.address[0].text.split(",")[0].split("-")[0];
                    var ward = data.entry[0].resource.address[0].text.split(",")[0].split("-")[1];
                    var middle_name = "";
                    var last_name = data.entry[0].resource.name[0].family;
                    if (first_name.split(" ").length > 1) {
                        middle_name = first_name.split(" ")[1];
                        first_name = first_name.split(" ")[0]
                    } else if (last_name.split(" ").length > 1) {
                        middle_name = last_name.split(" ")[0];
                        last_name = last_name.split(" ")[1]
                    }

                    var xhr = new XMLHttpRequest;
                    xhr.open("GET", window.location.origin + '/insurance/Eligibility.php?identifier=' + $scope.searchParameters.customAttribute,true);
                        xhr.onreadystatechange = function(){
                            xhr.onload  = function(){
                                if(xhr.status == 200){
                                    var response = JSON.parse(xhr.responseText);
                                    var coPayment = response.coPayment;
                                    var remainingBalance = response.eligibility.insurance[0].benefitBalance[0].financial[0].allowedMoney.value;
                                    var expiryDate = response.eligibility.insurance[0].contract.reference.split("/")[2].split(" ")[0];
                                    var todayDate = new Date()
                                    var year = todayDate.getFullYear();
                                    var month = todayDate.getMonth() + 1; 
                                    var day = todayDate.getDate();
                                    var formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
                                    if (expiryDate < formattedDate || remainingBalance <= 0){
                                        var copaymentStatus = "Inactive";
                                    }

                                    else if (expiryDate > formattedDate && remainingBalance > 0 ){
                                        var copaymentStatus = "Active";
                                    }
                                    var copaymentStatusValue = copaymentStatus === "Inactive"? 0 : 1;

                                    var queryParams = {
                                        fname: first_name,
                                        middle_name: middle_name,
                                        last_name: last_name,
                                        phone: phone,
                                        municipality: municipality,
                                        ward: ward,
                                        gender: gender,
                                        dob: birthdate,
                                        nhis: $scope.searchParameters.customAttribute,
                                        copaymentStatusValue: copaymentStatusValue,
                                        coPayment:coPayment
                                    };
                                    
                                    var hibResponseData = queryParams;
                                    patientService.setData(hibResponseData);  

                                    $scope.hideNewLoader();
                                    var url = "/bahmni/registration/index.html#/patient/new";
                                   

                                 
                                   //var url = "/bahmni/registration/index.html#/patient/new?";
                                    location.href = url;
                                }
                            }
                        }
                        xhr.send();
                }
                else{
                    $scope.hideNewLoader();
                    var data = this.response;
                    if (this.response) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'HIB insurance patient detail not found',
                            showConfirmButton: false,
                            timer: 1200 // 2 seconds (in milliseconds)
                        });
                    }
                }


            };
            xmlhttp.send();
           } catch(err){
            alert("" + err)
           }
        }
    };
    $scope.searchPatients = function() {
        if (!isUserPrivilegedForSearch()) return void showInsufficientPrivMessage();
        var queryParams = {};
        $scope.results = [], $scope.searchParameters.name && (queryParams.name = $scope.searchParameters.name), $scope.searchParameters.addressFieldValue && (queryParams.addressFieldValue = $scope.searchParameters.addressFieldValue), $scope.searchParameters.customAttribute && $scope.customAttributesSearchConfig.show && (queryParams.customAttribute = $scope.searchParameters.customAttribute), $scope.searchParameters.programAttributeFieldValue && $scope.programAttributesSearchConfig.show && (queryParams.programAttributeFieldName = $scope.programAttributesSearchConfig.field, queryParams.programAttributeFieldValue = $scope.searchParameters.programAttributeFieldValue), $location.search(queryParams)
    }, $scope.resultsPresent = function() {
        return angular.isDefined($scope.results) && $scope.results.length > 0
    }, $scope.editPatientUrl = function(url, options) {
        var temp = url;
        for (var key in options) temp = temp.replace("{{" + key + "}}", options[key]);
        return temp
    }, $scope.nextPage = function() {
        if (!$scope.nextPageLoading) {
            $scope.nextPageLoading = !0;
            var promise = searchBasedOnQueryParameters($scope.results.length);
            promise && promise.then(function(data) {
                angular.forEach(data.pageOfResults, function(result) {
                    $scope.results.push(result)
                }), $scope.noMoreResultsPresent = 0 === data.pageOfResults.length, $scope.nextPageLoading = !1
            }, function() {
                $scope.nextPageLoading = !1
            })
        }
    }, $scope.forPatient = function(patient) {
        return $scope.selectedPatient = patient, $scope
    }, $scope.doExtensionAction = function(extension) {
        var forwardTo = appService.getAppDescriptor().formatUrl(extension.url, {
            patientUuid: $scope.selectedPatient.uuid
        });
        if ("Print" === extension.label) {
            var params = identifyParams(forwardTo);
            if ("dialog" === params.launch) {
                var firstChar = forwardTo.charAt(0),
                    prefix = "/" === firstChar ? "#" : "#/",
                    hiddenFrame = $("#printPatientFrame")[0];
                hiddenFrame.src = prefix + forwardTo, hiddenFrame.contentWindow.print()
            } else $location.url(forwardTo)
        } else $location.url(forwardTo)
    }, $scope.extensionActionText = function(extension) {
        return $filter("titleTranslate")(extension)
    }, $scope.isExtraIdentifierConfigured = function() {
        return !_.isEmpty($scope.extraIdentifierTypes)
    }
}]), angular.module("bahmni.registration").controller("PatientCommonController", ["$scope", "$rootScope", "$http", "patientAttributeService", "appService", "spinner", "$location", "ngDialog", "$window", "$state", "visitService", function($scope, $rootScope, $http, patientAttributeService, appService, spinner, $location, ngDialog, $window, $state, visitService) {
    var caste, autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []),
        showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox"),
        personAttributes = [];
    $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName"), $scope.showLastName = appService.getAppDescriptor().getConfigValue("showLastName"), $scope.isLastNameMandatory = $scope.showLastName && appService.getAppDescriptor().getConfigValue("isLastNameMandatory"), $scope.showBirthTime = null == appService.getAppDescriptor().getConfigValue("showBirthTime") || appService.getAppDescriptor().getConfigValue("showBirthTime"), $scope.genderCodes = Object.keys($rootScope.genderMap), $scope.dobMandatory = appService.getAppDescriptor().getConfigValue("dobMandatory") || !1, $scope.readOnlyExtraIdentifiers = appService.getAppDescriptor().getConfigValue("readOnlyExtraIdentifiers"), $scope.enableNepaliCalendar = appService.getAppDescriptor().getConfigValue("enableNepaliCalendar"), $scope.npToday = Bahmni.Common.Util.DateUtil.npToday(), $scope.showSaveConfirmDialogConfig = appService.getAppDescriptor().getConfigValue("showSaveConfirmDialog"), $scope.showSaveAndContinueButton = !1;
    var dontSaveButtonClicked = !1,
        isHref = !1;
    $rootScope.onHomeNavigate = function(event) {
        $scope.showSaveConfirmDialogConfig && "patient.visit" != $state.current.name && (event.preventDefault(), $scope.targetUrl = event.currentTarget.getAttribute("href"), isHref = !0, $scope.confirmationPrompt(event))
    };
    var stateChangeListener = $rootScope.$on("$stateChangeStart", function(event, toState, toParams) {
        !$scope.showSaveConfirmDialogConfig || "/search" != toState.url && "/patient/new" != toState.url || ($scope.targetUrl = toState.name, isHref = !1, $scope.confirmationPrompt(event, toState, toParams))
    });
    $scope.confirmationPrompt = function(event, toState) {
        dontSaveButtonClicked === !1 && (event && event.preventDefault(), ngDialog.openConfirm({
            template: "../common/ui-helper/views/saveConfirmation.html",
            scope: $scope
        }))
    }, $scope.continueWithoutSaving = function() {
        ngDialog.close(), dontSaveButtonClicked = !0, isHref === !0 ? $window.open($scope.targetUrl, "_self") : $state.go($scope.targetUrl)
    }, $scope.cancelTransition = function() {
        ngDialog.close(), delete $scope.targetUrl
    }, $scope.$on("$destroy", function() {
        stateChangeListener()
    }), $scope.getDeathConcepts = function() {
        return $http({
            url: Bahmni.Common.Constants.globalPropertyUrl,
            method: "GET",
            params: {
                property: "concept.reasonForDeath"
            },
            withCredentials: !0,
            transformResponse: [function(deathConcept) {
                _.isEmpty(deathConcept) ? $scope.deathConceptExists = !1 : $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                    params: {
                        name: deathConcept,
                        v: "custom:(uuid,name,set,setMembers:(uuid,display,name:(uuid,name),retired))"
                    },
                    withCredentials: !0
                }).then(function(results) {
                    $scope.deathConceptExists = !!results.data.results.length, $scope.deathConcepts = results.data.results[0] ? results.data.results[0].setMembers : [], $scope.deathConcepts = filterRetireDeathConcepts($scope.deathConcepts)
                })
            }]
        })
    }, spinner.forPromise($scope.getDeathConcepts());
    var filterRetireDeathConcepts = function(deathConcepts) {
        return _.filter(deathConcepts, function(concept) {
            return !concept.retired
        })
    };
    $scope.isAutoComplete = function(fieldName) {
        return !_.isEmpty(autoCompleteFields) && autoCompleteFields.indexOf(fieldName) > -1
    }, $scope.showCasteSameAsLastName = function() {
        personAttributes = _.map($rootScope.patientConfiguration.attributeTypes, function(attribute) {
            return attribute.name.toLowerCase()
        });
        var personAttributeHasCaste = personAttributes.indexOf("caste") !== -1;
        return caste = personAttributeHasCaste ? $rootScope.patientConfiguration.attributeTypes[personAttributes.indexOf("caste")].name : void 0, showCasteSameAsLastNameCheckbox && personAttributeHasCaste
    }, $scope.setCasteAsLastName = function() {
        $scope.patient.sameAsLastName && ($scope.patient[caste] = $scope.patient.familyName)
    };
    var showSections = function(sectionsToShow, allSections) {
            _.each(sectionsToShow, function(sectionName) {
                allSections[sectionName].canShow = !0, allSections[sectionName].expand = !0
            })
        },
        hideSections = function(sectionsToHide, allSections) {
            _.each(sectionsToHide, function(sectionName) {
                allSections[sectionName].canShow = !1
            })
        },
        executeRule = function(ruleFunction) {
            var attributesShowOrHideMap = ruleFunction($scope.patient),
                patientAttributesSections = $rootScope.patientConfiguration.getPatientAttributesSections();
            showSections(attributesShowOrHideMap.show, patientAttributesSections), hideSections(attributesShowOrHideMap.hide, patientAttributesSections)
        };
        
        $scope.download = function() {
            
           
                var text = "Do you want to use Claim ID? Once the claim ID is generated, it cannot be repeated.";
                var confirmed = confirm(text);
        
                if (confirmed) {
                    $http({
                        url: location.origin +"/insurance/getClaimCode.php",
                        method: 'GET'
                    }).then(function(response) {
                        var data = response.data;
                        var dataID = data.claimCode;
                        console.log("Id:", dataID);
                        visitService.setgetClaimID(dataID);
        
                        var pos1 = 0;
                        for (var i = 0; i < document.getElementsByTagName("input").length; i++) {
                            if (document.getElementsByTagName("input")[i].id == 'Claim Id') {
                                pos1 = i;
                            }
                        }
                        var input = angular.element(document.getElementsByTagName("input")[pos1]);
                        var model = input.controller('ngModel'); 
        
                        model.$setViewValue(dataID);   
                        model.$render();
                    }).catch(function(error) {
                        console.log("Error:", error);
                    });
                }
          
     }
        
        
        
        
    $scope.showNewLoader = function() {
        document.getElementById("backgroundLoader").style.display = "block"
    }, $scope.hideNewLoader = function() {
        document.getElementById("backgroundLoader").style.display = "none"
    };
    $scope.eligibilityClicked = function() {
        $scope.showNewLoader();
        var nhisnumberInput = document.getElementById("NHIS Number").value;
        var xhr = new XMLHttpRequest;
        xhr.open("GET", window.location.origin + "/insurance/Eligibility.php?identifier=" + nhisnumberInput, true);
        xhr.onreadystatechange = function() {
            if (xhr.status == 503) {
                $scope.hideNewLoader();
                Swal.fire({
                    title: "No Internet Connection"
                })
            } else if (xhr.status == 404) {
                $scope.hideNewLoader();
                Swal.fire({
                    title: "Data Not Found",
                    text: "Enter Correct NHIS Number"
                })
            }
            xhr.onload = function() {
                if (xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    var remainingBalance = response.eligibility.insurance[0].benefitBalance[0].financial[0].allowedMoney.value;
                    var expiryDate = response.eligibility.insurance[0].contract.reference.split("/")[2].split(" ")[0];
                    var copayment = response.coPayment;
                    var todayDate = new Date;
                    var year = todayDate.getFullYear();
                    var month = todayDate.getMonth() + 1;
                    var day = todayDate.getDate();
                    var formattedDate = year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
                    if (expiryDate < formattedDate || remainingBalance <= 0) {
                        var copaymentStatus = "Inactive"
                    } else if (expiryDate > formattedDate && remainingBalance > 0) {
                        var copaymentStatus = "Active"
                    }
                    var icon = copaymentStatus === "Active" ? "success" : "error";
                    var coPay = copayment === .1 ? "10 % Copayment Applicable" : "0% Copayment Charge";
                    var xhr2 = new XMLHttpRequest;
                    xhr2.open("GET", window.location.origin + "/insurance/Patient.php?identifier=" + nhisnumberInput, true);
                    xhr2.onreadystatechange = function() {
                        if (xhr.status == 503) {
                            $scope.hideNewLoader();
                            Swal.fire({
                                title: "No Internet Connection"
                            })
                        }
                        xhr2.onload = function() {
                            if (xhr2.status == 200) {
                                $scope.hideNewLoader();
                                var secondResponse = JSON.parse(xhr2.responseText);
                                var firstName = secondResponse.entry[0].resource.name[0].given[0];
                                var lastName = secondResponse.entry[0].resource.name[0].family;
                                var name = formatName(firstName, lastName);
                                var phoneNumber = secondResponse.entry[0].resource.telecom[0].value;
                                if (secondResponse.entry[0].resource.address != null) {
                                    var addressInput = secondResponse.entry[0].resource.address[0].text;
                                    var address = addressInput.charAt(0).toUpperCase() + addressInput.slice(1).toLowerCase()
                                } else if (secondResponse.entry[0].resource.address == null) {
                                    var address = " "
                                }
                                var birthDate = new Date(secondResponse.entry[0].resource.birthDate);
                                var ageDiffMs = Date.now() - birthDate.getTime();
                                var ageDate = new Date(ageDiffMs);
                                var age = Math.abs(ageDate.getUTCFullYear() - 1970);
                                var fspName = formatFspName(secondResponse.entry[0].resource.extension[7].valueString);
                                var fspAddress = secondResponse.entry[0].resource.extension[8].valueString;
                                var fsp = fspName + "," + " " + fspAddress;
                                var img = secondResponse.entry[0].resource.extension[6].valueString;
                                Swal.fire({
                                    title: `${coPay}\n\n\nStatus : ${copaymentStatus}`,
                                    icon: icon,
                                    html: `
                                                    <img fallback-src = "../images/blank-user.gif" src= "${img}" ng-src = "${img}" 
                                                    style ="width: 144px; height: 164px; border-radius: 50%; border: 2px;overflow: hidden;">
                                                    <div style="text-align:left; margin-left: 45px;  margin-top: 20px;">
                                                        <p><strong>Name :</strong><span style="margin-left: 5px;">${name}</span></p>
                                                        <p><strong>First Service Point :</strong><span style="margin-left: 5px;">${fsp}</span></p>
                                                        <p><strong>Age :</strong><span style="margin-left: 5px;">${age}</span></p>
                                                        <p><strong>Phone Number :</strong><span style="margin-left: 5px;">${phoneNumber}</span></p>
                                                        <p><strong>Address :</strong><span style="margin-left: 5px;">${address}</span></p>
                                                        <p><strong>Total Remaining Balance :</strong><span style="margin-left: 5px;">${remainingBalance}</span></p>
                                                        <p><strong>Date of Expiry :</strong><span style="margin-left: 5px;">${expiryDate}</span></p>
                                                    </div>
                                                `
                                });

                                function formatName(firstName, lastName) {
                                    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() + " " + lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase()
                                }

                                function formatFspName(fspName) {
                                    var words = fspName.split(" ");
                                    for (var i = 0; i < words.length; i++) {
                                        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
                                    }
                                    var formattedString = words.join(" ");
                                    return formattedString
                                }
                            }
                        }
                    };
                    xhr2.send()
                }
            }
        };
        xhr.send()
    };
    $scope.handleUpdate = function(attribute) {
        var ruleFunction = Bahmni.Registration.AttributesConditions.rules && Bahmni.Registration.AttributesConditions.rules[attribute];
        ruleFunction && executeRule(ruleFunction);
        var casteInput = document.getElementById("Caste");
        var address1Input = document.getElementById("address1");
        if (address1Input) {
            address1Input.addEventListener("keydown", function(event) {
                if (event.key === "Tab") {
                    event.preventDefault();
                    casteInput.focus()
                }
            })
        }
        if (attribute == "CoPayment Check") {
            var coPaymentCheck = document.getElementById("CoPayment Check").checked;
            var coPayment;
            if (coPaymentCheck == true) {
                coPayment = .1
            } else if (coPaymentCheck == false) {
                coPayment = 0
            }
            visitService.setcoPaymentValue(coPayment)
        }
    };
    var executeShowOrHideRules = function() {
        _.each(Bahmni.Registration.AttributesConditions.rules, function(rule) {
            executeRule(rule)
        })
    };
    $scope.$watch("patientLoaded", function() {
        $scope.patientLoaded && executeShowOrHideRules()
    }), $scope.getAutoCompleteList = function(attributeName, query, type) {
        return patientAttributeService.search(attributeName, query, type)
    }, $scope.getDataResults = function(data) {
        return data.results
    }, $scope.$watch("patient.familyName", function() {
        $scope.patient.sameAsLastName && ($scope.patient[caste] = $scope.patient.familyName)
    }), $scope.$watch("patient.caste", function() {
        $scope.patient.sameAsLastName && $scope.patient.familyName !== $scope.patient[caste] && ($scope.patient.sameAsLastName = !1)
    }), $scope.selectIsDead = function() {
        ($scope.patient.causeOfDeath || $scope.patient.deathDate) && ($scope.patient.dead = !0)
    }, $scope.disableIsDead = function() {
        return ($scope.patient.causeOfDeath || $scope.patient.deathDate) && $scope.patient.dead
    }, $scope.updateDeathInfo = function() {
        var dateStr = $scope.patient.deathDateBS.split("-");
        $scope.patient.deathDate = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]))
    }
}]), angular.module("bahmni.registration").controller("CreatePatientController", ["$scope", "$rootScope", "$state", "patientService", "patient", "spinner", "appService", "messagingService", "ngDialog", "$q", function($scope, $rootScope, $state, patientService, patient, spinner, appService, messagingService, ngDialog, $q) {
    var dateUtil = Bahmni.Common.Util.DateUtil;
    $scope.actions = {};
    var errorMessage, configValueForEnterId = appService.getAppDescriptor().getConfigValue("showEnterID");
    $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy"), $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture"), $scope.showEnterID = null === configValueForEnterId || configValueForEnterId, $scope.today = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(dateUtil.now());
    var getPersonAttributeTypes = function() {
            return $rootScope.patientConfiguration.attributeTypes
        },
        prepopulateDefaultsInFields = function() {
            var personAttributeTypes = getPersonAttributeTypes(),
                patientInformation = appService.getAppDescriptor().getConfigValue("patientInformation");
            if (patientInformation && patientInformation.defaults) {
                var defaults = patientInformation.defaults,
                    defaultVariableNames = _.keys(defaults),
                    hasDefaultAnswer = function(personAttributeType) {
                        return _.includes(defaultVariableNames, personAttributeType.name)
                    },
                    isConcept = function(personAttributeType) {
                        return "org.openmrs.Concept" === personAttributeType.format
                    },
                    setDefaultAnswer = function(personAttributeType) {
                        $scope.patient[personAttributeType.name] = defaults[personAttributeType.name]
                    },
                    setDefaultConcept = function(personAttributeType) {
                        var defaultAnswer = defaults[personAttributeType.name],
                            isDefaultAnswer = function(answer) {
                                return answer.fullySpecifiedName === defaultAnswer
                            };
                        _.chain(personAttributeType.answers).filter(isDefaultAnswer).each(function(answer) {
                            $scope.patient[personAttributeType.name] = {
                                conceptUuid: answer.conceptId,
                                value: answer.fullySpecifiedName
                            }
                        }).value()
                    };
                _.chain(personAttributeTypes).filter(hasDefaultAnswer).each(setDefaultAnswer).filter(isConcept).each(setDefaultConcept).value()
            }
        },
        expandSectionsWithDefaultValue = function() {
            angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function(section) {
                var notNullAttribute = _.find(section && section.attributes, function(attribute) {
                    return void 0 !== $scope.patient[attribute.name]
                });
                section.expand = section.expanded || !!notNullAttribute
            })
        },
        init = function() {
            $scope.patient = patient.create(), console.log(patient), prepopulateDefaultsInFields(), expandSectionsWithDefaultValue(), $scope.patientLoaded = !0
        };
    init();
    var prepopulateFields = function() {
        var fieldsToPopulate = appService.getAppDescriptor().getConfigValue("prepopulateFields");
        fieldsToPopulate && _.each(fieldsToPopulate, function(field) {
            var addressLevel = _.find($scope.addressLevels, function(level) {
                return level.name === field
            });
            addressLevel && ($scope.patient.address[addressLevel.addressField] = $rootScope.loggedInLocation[addressLevel.addressField])
        })
    };
    prepopulateFields();
    var addNewRelationships = function() {
            var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function(relationship) {
                return relationship.relationshipType && relationship.relationshipType.uuid
            });
            newRelationships = _.each(newRelationships, function(relationship) {
                delete relationship.patientIdentifier, delete relationship.content, delete relationship.providerName
            }), $scope.patient.relationships = newRelationships
        },
        getConfirmationViaNgDialog = function(config) {
            var ngDialogLocalScope = config.scope.$new();
            ngDialogLocalScope.yes = function() {
                ngDialog.close(), config.yesCallback()
            }, ngDialogLocalScope.no = function() {
                ngDialog.close()
            }, ngDialog.open({
                template: config.template,
                data: config.data,
                scope: ngDialogLocalScope
            })
        },
        copyPatientProfileDataToScope = function(response) {
            var patientProfileData = response.data;
            $scope.patient.uuid = patientProfileData.patient.uuid, $scope.patient.name = patientProfileData.patient.person.names[0].display, $scope.patient.isNew = !0, $scope.patient.registrationDate = dateUtil.now(), $scope.patient.newlyAddedRelationships = [{}], $scope.actions.followUpAction(patientProfileData)
        },
        createPatient = function(jumpAccepted) {
            return patientService.create($scope.patient, jumpAccepted).then(function(response) {
                response && copyPatientProfileDataToScope(response)
            }, function(response) {
                if (412 === response.status) {
                    var data = _.map(response.data, function(data) {
                        return {
                            sizeOfTheJump: data.sizeOfJump,
                            identifierName: _.find($rootScope.patientConfiguration.identifierTypes, {
                                uuid: data.identifierType
                            }).name
                        }
                    });
                    getConfirmationViaNgDialog({
                        template: "views/customIdentifierConfirmation.html",
                        data: data,
                        scope: $scope,
                        yesCallback: function() {
                            return createPatient(!0)
                        }
                    })
                }
                response.isIdentifierDuplicate && (errorMessage = response.message)
            })
        },
        createPromise = function() {
            var deferred = $q.defer();
            return createPatient()["finally"](function() {
                return deferred.resolve({})
            }), deferred.promise
        };
    $scope.create = function() {
        addNewRelationships();
        var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
        return errorMessages.length > 0 ? (errorMessages.forEach(function(errorMessage) {
            messagingService.showMessage("error", errorMessage)
        }), $q.when({})) : spinner.forPromise(createPromise()).then(function(response) {
            errorMessage && (messagingService.showMessage("error", errorMessage), errorMessage = void 0)
        })
    }, $scope.afterSave = function() {
        messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED"), $state.go("patient.edit", {
            patientUuid: $scope.patient.uuid
        })
    }
}]), angular.module("bahmni.registration").controller("EditPatientController", ["$scope", "patientService", "encounterService", "$stateParams", "openmrsPatientMapper", "$window", "$q", "spinner", "appService", "messagingService", "$rootScope", "auditLogService", function($scope, patientService, encounterService, $stateParams, openmrsPatientMapper, $window, $q, spinner, appService, messagingService, $rootScope, auditLogService) {
    var dateUtil = Bahmni.Common.Util.DateUtil,
        uuid = $stateParams.patientUuid;
    $scope.patient = {}, $scope.actions = {}, $scope.addressHierarchyConfigs = appService.getAppDescriptor().getConfigValue("addressHierarchy"), $scope.disablePhotoCapture = appService.getAppDescriptor().getConfigValue("disablePhotoCapture"), $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.today = dateUtil.getDateWithoutTime(dateUtil.now());
    var setReadOnlyFields = function() {
            $scope.readOnlyFields = {};
            var readOnlyFields = appService.getAppDescriptor().getConfigValue("readOnlyFields");
            angular.forEach(readOnlyFields, function(readOnlyField) {
                $scope.patient[readOnlyField] && ($scope.readOnlyFields[readOnlyField] = !0)
            })
        },
        successCallBack = function(openmrsPatient) {
            $scope.openMRSPatient = openmrsPatient.patient, $scope.patient = openmrsPatientMapper.map(openmrsPatient), setReadOnlyFields(), expandDataFilledSections(), $scope.patientLoaded = !0
        },
        expandDataFilledSections = function() {
            angular.forEach($rootScope.patientConfiguration && $rootScope.patientConfiguration.getPatientAttributesSections(), function(section) {
                var notNullAttribute = _.find(section && section.attributes, function(attribute) {
                    return void 0 !== $scope.patient[attribute.name]
                });
                section.expand = section.expanded || !!notNullAttribute
            })
        };
    ! function() {
        var getPatientPromise = patientService.get(uuid).then(successCallBack),
            isDigitized = encounterService.getDigitized(uuid);
        isDigitized.then(function(data) {
            var encountersWithObservations = data.data.results.filter(function(encounter) {
                return encounter.obs.length > 0
            });
            $scope.isDigitized = encountersWithObservations.length > 0
        }), spinner.forPromise($q.all([getPatientPromise, isDigitized]))
    }(), $scope.update = function() {
        addNewRelationships();
        var errorMessages = Bahmni.Common.Util.ValidationUtil.validate($scope.patient, $scope.patientConfiguration.attributeTypes);
        return errorMessages.length > 0 ? (errorMessages.forEach(function(errorMessage) {
            messagingService.showMessage("error", errorMessage)
        }), $q.when({})) : spinner.forPromise(patientService.update($scope.patient, $scope.openMRSPatient).then(function(result) {
            var patientProfileData = result.data;
            patientProfileData.error || (successCallBack(patientProfileData), $scope.actions.followUpAction(patientProfileData))
        }))
    };
    var addNewRelationships = function() {
        var newRelationships = _.filter($scope.patient.newlyAddedRelationships, function(relationship) {
            return relationship.relationshipType && relationship.relationshipType.uuid
        });
        newRelationships = _.each(newRelationships, function(relationship) {
            delete relationship.patientIdentifier, delete relationship.content, delete relationship.providerName
        }), $scope.patient.relationships = _.concat(newRelationships, $scope.patient.deletedRelationships)
    };
    $scope.isReadOnly = function(field) {
        return $scope.readOnlyFields ? !!$scope.readOnlyFields[field] : void 0
    }, $scope.afterSave = function() {
        auditLogService.log($scope.patient.uuid, Bahmni.Registration.StateNameEvenTypeMap["patient.edit"], void 0, "MODULE_LABEL_REGISTRATION_KEY"), messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED")
    }
}]), angular.module("bahmni.registration").directive("patientAction", ["$window", "$location", "$state", "spinner", "$rootScope", "$stateParams", "$bahmniCookieStore", "appService", "visitService", "sessionService", "encounterService", "messagingService", "$translate", "auditLogService", "patientService", function($window, $location, $state, spinner, $rootScope, $stateParams, $bahmniCookieStore, appService, visitService, sessionService, encounterService, messagingService, $translate, auditLogService, patientService) {
    var controller = function($scope) {
        function setForwardActionKey() {
            0 === editActionsConfig.length ? $scope.forwardActionKey = self.hasActiveVisit ? getForwardUrlEntryForVisitFromTheConfig() ? keyForActiveVisitEntry() : "enterVisitDetails" : "startVisit" : ($scope.actionConfig = editActionsConfig[0], $scope.forwardActionKey = "configAction")
        }
        var self = this,
            uuid = $stateParams.patientUuid,
            editActionsConfig = appService.getAppDescriptor().getExtensions(Bahmni.Registration.Constants.nextStepConfigId, "config") || [],
            loginLocationUuid = (appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config"), $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid),
            defaultVisitType = $rootScope.regEncounterConfiguration.getDefaultVisitType(loginLocationUuid);
        defaultVisitType = defaultVisitType || appService.getAppDescriptor().getConfigValue("defaultVisitType");
        var showStartVisitButton = appService.getAppDescriptor().getConfigValue("showStartVisitButton"),
            forwardUrlsForVisitTypes = appService.getAppDescriptor().getConfigValue("forwardUrlsForVisitTypes");
        showStartVisitButton = !(!_.isUndefined(showStartVisitButton) && !_.isNull(showStartVisitButton)) || showStartVisitButton;
        var visitLocationUuid = $rootScope.visitLocation,
            forwardUrls = forwardUrlsForVisitTypes || !1,
            getForwardUrlEntryForVisitFromTheConfig = function() {
                var matchedEntry = _.find(forwardUrls, function(entry) {
                    return self.hasActiveVisit ? entry.visitType === self.activeVisit.visitType.name : entry.visitType === $scope.visitControl.selectedVisitType.name
                });
                return matchedEntry
            },
            keyForActiveVisitEntry = function() {
                var matchedEntry = getForwardUrlEntryForVisitFromTheConfig();
                if (matchedEntry) return $scope.activeVisitConfig = matchedEntry, _.isEmpty(_.get($scope.activeVisitConfig, "translationKey")) && ($scope.activeVisitConfig.translationKey = "REGISTRATION_LABEL_ENTER_VISIT", $scope.activeVisitConfig.shortcutKey = "REGISTRATION_ENTER_VISIT_DETAILS_ACCESS_KEY"), "forwardAction"
            },
            init = function() {
                if (_.isEmpty(uuid)) return self.hasActiveVisit = !1, void setForwardActionKey();
                var searchParams = {
                    patient: uuid,
                    includeInactive: !1,
                    v: "custom:(uuid,visitType,location:(uuid))"
                };
                spinner.forPromise(visitService.search(searchParams).then(function(response) {
                    var activeVisitForCurrentLoginLocation, results = response.data.results;
                    results && (activeVisitForCurrentLoginLocation = _.filter(results, function(result) {
                        return result.location.uuid === visitLocationUuid
                    })), self.hasActiveVisit = activeVisitForCurrentLoginLocation && activeVisitForCurrentLoginLocation.length > 0, self.hasActiveVisit && (self.activeVisit = activeVisitForCurrentLoginLocation[0]), setForwardActionKey()
                }))
            };
        $scope.visitControl = new Bahmni.Common.VisitControl($rootScope.regEncounterConfiguration.getVisitTypesAsArray(), defaultVisitType, encounterService, $translate, visitService, patientService), $scope.visitControl.onStartVisit = function() {
            $scope.setSubmitSource("startVisit")
        }, $scope.setSubmitSource = function(source) {
            $scope.actions.submitSource = source
        }, $scope.showStartVisitButton = function() {
            return showStartVisitButton
        };
        var goToForwardUrlPage = function(patientData) {
            var forwardUrl = appService.getAppDescriptor().formatUrl($scope.activeVisitConfig.forwardUrl, {
                patientUuid: patientData.patient.uuid
            });
            $window.location.href = forwardUrl
        };
        $scope.actions.followUpAction = function(patientProfileData) {
            switch (messagingService.clearAll(), $scope.actions.submitSource) {
                case "startVisit":
                    var entry = getForwardUrlEntryForVisitFromTheConfig(),
                        forwardUrl = entry ? entry.forwardUrl : void 0;
                    return createVisit(patientProfileData, forwardUrl);
                case "forwardAction":
                    return goToForwardUrlPage(patientProfileData);
                case "enterVisitDetails":
                    return goToVisitPage(patientProfileData);
                case "configAction":
                    return handleConfigAction(patientProfileData);
                case "save":
                    $scope.afterSave()
            }
        };
        var handleConfigAction = function(patientProfileData) {
                var forwardUrl = appService.getAppDescriptor().formatUrl($scope.actionConfig.extensionParams.forwardUrl, {
                    patientUuid: patientProfileData.patient.uuid
                });
                self.hasActiveVisit ? $window.location.href = forwardUrl : createVisit(patientProfileData, forwardUrl)
            },
            goToVisitPage = function(patientData) {
                var copaymentValue = visitService.getcoPaymentValue();
                if (copaymentValue == null) {
                    if (document.getElementById("CoPayment Check").checked == false) {
                        copaymentValue = 0
                    } else if (document.getElementById("CoPayment Check").checked == true) {
                        copaymentValue = .1
                    }
                }
                $scope.patient.uuid = patientData.patient.uuid, $scope.patient.name = patientData.patient.person.names[0].display, $location.path("/patient/" + patientData.patient.uuid + "/visit&coPayment=" + copaymentValue)
            },
            isEmptyVisitLocation = function() {
                return _.isEmpty($rootScope.visitLocation)
            },
            createVisit = function(patientProfileData, forwardUrl) {
                return isEmptyVisitLocation() ? void $state.go("patient.edit", {
                    patientUuid: $scope.patient.uuid
                }).then(function() {
                    messagingService.showMessage("error", "NO_LOCATION_TAGGED_TO_VISIT_LOCATION")
                }) : void spinner.forPromise($scope.visitControl.createVisitOnly(patientProfileData.patient.uuid, $rootScope.visitLocation).then(function(response) {
                    if (auditLogService.log(patientProfileData.patient.uuid, "OPEN_VISIT", {
                            visitUuid: response.data.uuid,
                            visitType: response.data.visitType.display
                        }, "MODULE_LABEL_REGISTRATION_KEY"), forwardUrl) {
                        var updatedForwardUrl = appService.getAppDescriptor().formatUrl(forwardUrl, {
                            patientUuid: patientProfileData.patient.uuid
                        });
                        $window.location.href = updatedForwardUrl
                    } else goToVisitPage(patientProfileData)
                }, function() {
                    $state.go("patient.edit", {
                        patientUuid: $scope.patient.uuid
                    })
                }))
            };
        init()
    };
    return {
        restrict: "E",
        templateUrl: "views/patientAction.html",
        controller: controller
    }
}]), angular.module("bahmni.registration").controller("VisitController", ["$window", "$scope", "$rootScope", "$state", "$bahmniCookieStore", "patientService", "encounterService", "$stateParams", "spinner", "$timeout", "$q", "appService", "openmrsPatientMapper", "contextChangeHandler", "messagingService", "sessionService", "visitService", "$location", "$translate", "auditLogService", "formService", "patientServiceStrategy", "toaster", "$http", function($window, $scope, $rootScope, $state, $bahmniCookieStore, patientService, encounterService, $stateParams, spinner, $timeout, $q, appService, openmrsPatientMapper, contextChangeHandler, messagingService, sessionService, visitService, $location, $translate, auditLogService, formService, patientServiceStrategy, toaster, $http) {
    var vm = this,
        patientUuid = $stateParams.patientUuid,
        extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config"),
        formExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "forms"),
        locationUuid = sessionService.getLoginLocationUuid(),
        selectedProvider = $rootScope.currentProvider,
        regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType],
        visitLocationUuid = $rootScope.visitLocation,
        loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid,
        defaultVisitType = $rootScope.regEncounterConfiguration.getDefaultVisitType(loginLocationUuid);
    defaultVisitType = defaultVisitType || appService.getAppDescriptor().getConfigValue("defaultVisitType"), $scope.visitControl = new Bahmni.Common.VisitControl($rootScope.regEncounterConfiguration.getVisitTypesAsArray(), defaultVisitType, encounterService, $translate, visitService, patientService), $scope.visitControl.onStartVisit = function() {
        $scope.setSubmitSource("startVisit")
    }, $scope.setSubmitSource = function(source) {
        $scope.actions.submitSource = source
    }, $scope.showStartVisitButton = function() {
        return showStartVisitButton
    };
    var getPatient = function() {
            var deferred = $q.defer();
            return patientService.get(patientUuid).then(function(openMRSPatient) {
                deferred.resolve(openMRSPatient), $scope.patient = openmrsPatientMapper.map(openMRSPatient), $scope.patient.name = openMRSPatient.patient.person.names[0].display, $scope.patient.uuid = openMRSPatient.patient.uuid
            }), deferred.promise
        },
        getActiveEncounter = function() {
            var deferred = $q.defer();
            return encounterService.find({
                patientUuid: patientUuid,
                providerUuids: _.isEmpty($scope.currentProvider.uuid) ? null : [$scope.currentProvider.uuid],
                includeAll: !1,
                locationUuid: locationUuid,
                encounterTypeUuids: [regEncounterTypeUuid]
            }).then(function(response) {
                deferred.resolve(response), $scope.encounterUuid = response.data.encounterUuid, $scope.observations = response.data.observations;
                var visitTypeUuid = response.data.visitTypeUuid;
                visitService.getVisitType().then(function(visitTypeResponse) {
                    var visitType = _.find(visitTypeResponse.data.results, function(type) {
                        return type.uuid === visitTypeUuid
                    });
                    var locationhash = window.location.hash;
                    var copaymentDecimalValue = locationhash.split("=")[1];
                    $scope.coPayment = copaymentDecimalValue;
                    console.log(copaymentDecimalValue);
                    if ($scope.coPayment == "0") {
                        $scope.coPayment = 0
                    } else if ($scope.coPayment == "0.1") {
                        $scope.coPayment = .1
                    }
                    null != visitType && void 0 != visitType && ("OPD" === visitType.display ? $scope.visitTypePrice = "Rs 25" : "Proxy" === visitType.display ? $scope.visitTypePrice = "Rs 0" : "Follow up" === visitType.display ? $scope.visitTypePrice = "Rs 10" : "ANC" === visitType.display ? $scope.visitTypePrice = "Rs 0" : "Emergency" === visitType.display ? $scope.visitTypePrice = "Rs 50" : "IPD" === visitType.display ? $scope.visitTypePrice = "Rs 0" : "OPD EHS" === visitType.display ? $scope.visitTypePrice = "Rs 250" : "Free" === visitType.display && ($scope.visitTypePrice = "Rs 0"))
                })
            }), deferred.promise
        };
    $scope.updateToEmergency = function() {
        var visitId = 4;
        visitService.changeVisit(visitId, patientUuid).then(function(visitId, patientUuid) {
            $state.reload()
        }), toaster.success({
            title: "EMERGENCY",
            body: "Changed to ER"
        })
    }, $scope.updateToOPD = function() {
        var visitId = 5;
        visitService.changeVisit(visitId, patientUuid).then(function(visitId, patientUuid) {
            $state.reload()
        }), toaster.success({
            title: "OPD",
            body: "Changed to OPD"
        })
    }, $scope.updateToOPDEHS = function() {
        var visitId = 12;
        visitService.changeVisit(visitId, patientUuid).then(function(visitId, patientUuid) {
            $state.reload()
        }), toaster.success({
            title: "OPD EHS",
            body: "Changed to OPDEHS"
        })
    }, $scope.updateToFollowUp = function() {
        var visitId = 9;
        visitService.changeVisit(visitId, patientUuid).then(function(visitId, patientUuid) {
            $state.reload()
        }), toaster.success({
            title: "FOLLOW UP",
            body: "Changed to Followup"
        })
    }, $scope.updateToFree = function() {
        var visitId = 10;
        visitService.changeVisit(visitId, patientUuid).then(function(visitId, patientUuid) {
            $state.reload()
        }), toaster.success({
            title: "FREE VISIT",
            body: "Changed to Free Visit"
        })
    };
    var getAllForms = function() {
        var deferred = $q.defer();
        return formService.getFormList($scope.encounterUuid).then(function(response) {
            $scope.conceptSets = extensions.map(function(extension) {
                return new Bahmni.ConceptSet.ConceptSetSection(extension, $rootScope.currentUser, {}, [], {})
            }), $scope.observationForms = getObservationForms(formExtensions, response.data), $scope.conceptSets = $scope.conceptSets.concat($scope.observationForms), $scope.availableConceptSets = $scope.conceptSets.filter(function(conceptSet) {
                return conceptSet.isAvailable($scope.context)
            }), deferred.resolve(response.data)
        }), deferred.promise
    };
    $scope.hideFields = appService.getAppDescriptor().getConfigValue("hideFields"), $scope.back = function() {
        $state.go("patient.edit")
    }, $scope.updatePatientImage = function(image) {
        var updateImagePromise = patientService.updateImage($scope.patient.uuid, image.replace("data:image/jpeg;base64,", ""));
        return spinner.forPromise(updateImagePromise), updateImagePromise
    };
    var save = function() {
            $scope.encounter = {
                patientUuid: $scope.patient.uuid,
                locationUuid: locationUuid,
                encounterTypeUuid: regEncounterTypeUuid,
                orders: [],
                drugOrders: [],
                extensions: {}
            }, $bahmniCookieStore.put(Bahmni.Common.Constants.grantProviderAccessDataCookieName, selectedProvider, {
                path: "/",
                expires: 1
            }), $scope.encounter.observations = $scope.observations, $scope.encounter.observations = (new Bahmni.Common.Domain.ObservationFilter).filter($scope.encounter.observations), addFormObservations($scope.encounter.observations);
            var createPromise = encounterService.create($scope.encounter);
            return spinner.forPromise(createPromise), createPromise.then(function(response) {
                var visitUuid = response.data.visitUuid;
                $http.get(window.location.origin + "/openmrs/ws/rest/v1/bahmnicore/sql?visitUuid=" + visitUuid + "&coPaymentFee=" + $scope.coPayment + "&q=bahmni.sqlGet.updateCoPaymentFee&v=full").then(function(response) {
                    return console.log(response.data)
                });
                var messageParams = {
                    encounterUuid: response.data.encounterUuid,
                    encounterType: response.data.encounterType
                };
                auditLogService.log(patientUuid, "EDIT_ENCOUNTER", messageParams, "MODULE_LABEL_REGISTRATION_KEY");
                var visitType, visitTypeUuid;
                visitTypeUuid = response.data.visitTypeUuid, visitService.getVisitType().then(function(response) {
                    visitType = _.find(response.data.results, function(type) {
                        if (type.uuid === visitTypeUuid) return type
                    })
                })
            })
        },
        isUserPrivilegedToCloseVisit = function() {
            var applicablePrivs = [Bahmni.Common.Constants.closeVisitPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege],
                userPrivs = _.map($rootScope.currentUser.privileges, function(privilege) {
                    return privilege.name
                });
            return _.some(userPrivs, function(privName) {
                return _.includes(applicablePrivs, privName)
            })
        },
        searchActiveVisitsPromise = function() {
            return visitService.search({
                patient: patientUuid,
                includeInactive: !1,
                v: "custom:(uuid,location:(uuid))"
            }).then(function(response) {
                var activeVisitForCurrentLoginLocation, results = response.data.results;
                results && (activeVisitForCurrentLoginLocation = _.filter(results, function(result) {
                    return result.location.uuid === visitLocationUuid
                }));
                var hasActiveVisit = activeVisitForCurrentLoginLocation.length > 0;
                vm.visitUuid = hasActiveVisit ? activeVisitForCurrentLoginLocation[0].uuid : "", $scope.canCloseVisit = isUserPrivilegedToCloseVisit() && hasActiveVisit
            })
        };
    $scope.closeVisitIfDischarged = function() {
        visitService.getVisitSummary(vm.visitUuid).then(function(response) {
            var visitSummary = response.data;
            if (visitSummary.admissionDetails && !visitSummary.dischargeDetails) {
                messagingService.showMessage("error", "REGISTRATION_VISIT_CANNOT_BE_CLOSED");
                var messageParams = {
                    visitUuid: vm.visitUuid,
                    visitType: visitSummary.visitType
                };
                auditLogService.log(patientUuid, "CLOSE_VISIT_FAILED", messageParams, "MODULE_LABEL_REGISTRATION_KEY")
            } else closeVisit(visitSummary.visitType)
        })
    };
    var closeVisit = function(visitType) {
        var confirmed = $window.confirm($translate.instant("REGISTRATION_CONFIRM_CLOSE_VISIT"));
        confirmed && visitService.endVisit(vm.visitUuid).then(function() {
            $location.url(Bahmni.Registration.Constants.patientSearchURL);
            var messageParams = {
                visitUuid: vm.visitUuid,
                visitType: visitType
            };
            auditLogService.log(patientUuid, "CLOSE_VISIT", messageParams, "MODULE_LABEL_REGISTRATION_KEY")
        })
    };
    $scope.getMessage = function() {
        return $scope.message
    };
    var isObservationFormValid = function() {
            var valid = !0;
            return _.each($scope.observationForms, function(observationForm) {
                if (valid && observationForm.component) {
                    var value = observationForm.component.getValue();
                    value.errors && (messagingService.showMessage("error", "{{'REGISTRATION_FORM_ERRORS_MESSAGE_KEY' | translate }}"), valid = !1)
                }
            }), valid
        },
        validate = function() {
            var errorMessage, isFormValidated = mandatoryValidate(),
                deferred = $q.defer(),
                contxChange = contextChangeHandler.execute(),
                allowContextChange = contxChange.allow;
            return isObservationFormValid() ? allowContextChange ? isFormValidated ? (deferred.resolve(), deferred.promise) : (errorMessage = "REGISTRATION_LABEL_ENTER_MANDATORY_FIELDS", messagingService.showMessage("error", errorMessage), deferred.reject("Some fields are not valid"), deferred.promise) : (errorMessage = contxChange.errorMessage ? contxChange.errorMessage : "REGISTRATION_LABEL_CORRECT_ERRORS", messagingService.showMessage("error", errorMessage), deferred.reject("Some fields are not valid"), deferred.promise) : (deferred.reject("Some fields are not valid"), deferred.promise)
        },
        mandatoryConceptGroup = [],
        mandatoryValidate = function() {
            return conceptGroupValidation($scope.observations), isValid(mandatoryConceptGroup)
        },
        conceptGroupValidation = function(observations) {
            var concepts = _.filter(observations, function(observationNode) {
                return isMandatoryConcept(observationNode)
            });
            _.isEmpty(concepts) || (mandatoryConceptGroup = _.union(mandatoryConceptGroup, concepts))
        },
        isMandatoryConcept = function(observation) {
            return _.isEmpty(observation.groupMembers) ? observation.conceptUIConfig && observation.conceptUIConfig.required : void conceptGroupValidation(observation.groupMembers)
        },
        isValid = function(mandatoryConcepts) {
            var concept = mandatoryConcepts.filter(function(mandatoryConcept) {
                return !mandatoryConcept.hasValue() && (!(mandatoryConcept instanceof Bahmni.ConceptSet.Observation && mandatoryConcept.conceptUIConfig && mandatoryConcept.conceptUIConfig.multiSelect) && (mandatoryConcept.isMultiSelect ? _.isEmpty(mandatoryConcept.getValues()) : !mandatoryConcept.value))
            });
            return _.isEmpty(concept)
        },
        afterSave = function() {
            var forwardUrl = appService.getAppDescriptor().getConfigValue("afterVisitSaveForwardUrl");
            null != forwardUrl ? $window.location.href = appService.getAppDescriptor().formatUrl(forwardUrl, {
                patientUuid: patientUuid
            }) : $state.transitionTo($state.current, $state.params, {
                reload: !0,
                inherit: !1,
                notify: !0
            }), messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED")
        };
    $scope.submit = function() {
        return validate().then(save).then(afterSave)
    }, $scope.today = function() {
        return new Date
    }, $scope.disableFormSubmitOnEnter = function() {
        $(".visit-patient").find("input").keypress(function(e) {
            if (13 === e.which) return !1
        })
    };
    var getConceptSet = function() {
            var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.visitTypeUuid);
            $scope.context = {
                visitType: visitType,
                patient: $scope.patient
            }
        },
        getObservationForms = function(extensions, observationsForms) {
            var forms = [],
                observations = $scope.observations || [];
            return _.each(extensions, function(ext) {
                var options = ext.extensionParams || {},
                    observationForm = _.find(observationsForms, function(form) {
                        return form.formName === options.formName || form.name === options.formName
                    });
                if (observationForm) {
                    var formUuid = observationForm.formUuid || observationForm.uuid,
                        formName = observationForm.name || observationForm.formName,
                        formVersion = observationForm.version || observationForm.formVersion;
                    forms.push(new Bahmni.ObservationForm(formUuid, $rootScope.currentUser, formName, formVersion, observations, ext))
                }
            }), forms
        };
    $scope.isFormTemplate = function(data) {
        return data.formUuid
    };
    var addFormObservations = function(observations) {
        $scope.observationForms && (_.remove(observations, function(observation) {
            return observation.formNamespace
        }), _.each($scope.observationForms, function(observationForm) {
            if (observationForm.component) {
                var formObservations = observationForm.component.getValue();
                _.each(formObservations.observations, function(obs) {
                    observations.push(obs)
                })
            }
        }))
    };
    spinner.forPromise($q.all([getPatient(), getActiveEncounter(), searchActiveVisitsPromise()]).then(function() {
        getAllForms().then(function() {
            getConceptSet()
        })
    }))
}]), angular.module("bahmni.registration").factory("patientService", ["$http", "$rootScope", "$bahmniCookieStore", "$q", "patientServiceStrategy", "sessionService", function($http, $rootScope, $bahmniCookieStore, $q, patientServiceStrategy, sessionService) {
    var baseOpenMRSRESTURL = (Bahmni.Registration.Constants.openmrsUrl, Bahmni.Registration.Constants.baseOpenMRSRESTURL),
        search = function(query, identifier, addressFieldName, addressFieldValue, customAttributeValue, offset, customAttributeFields, programAttributeFieldName, programAttributeFieldValue, addressSearchResultsConfig, patientSearchResultsConfig, filterOnAllIdentifiers) {
            var config = {
                params: {
                    q: query,
                    identifier: identifier,
                    s: "byIdOrNameOrVillage",
                    addressFieldName: addressFieldName,
                    addressFieldValue: addressFieldValue,
                    customAttribute: customAttributeValue,
                    startIndex: offset || 0,
                    patientAttributes: customAttributeFields,
                    programAttributeFieldName: programAttributeFieldName,
                    programAttributeFieldValue: programAttributeFieldValue,
                    addressSearchResultsConfig: addressSearchResultsConfig,
                    patientSearchResultsConfig: patientSearchResultsConfig,
                    loginLocationUuid: sessionService.getLoginLocationUuid(),
                    filterOnAllIdentifiers: filterOnAllIdentifiers
                },
                withCredentials: !0
            };
            return patientServiceStrategy.search(config)
        },
        searchByIdentifier = function(identifier) {
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    identifier: identifier,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                },
                withCredentials: !0
            })
        },
        searchByNameOrIdentifier = function(query, limit) {
            return $http.get(Bahmni.Common.Constants.bahmniSearchUrl + "/patient", {
                method: "GET",
                params: {
                    q: query,
                    s: "byIdOrName",
                    limit: limit,
                    loginLocationUuid: sessionService.getLoginLocationUuid()
                },
                withCredentials: !0
            })
        },
        get = function(uuid) {
            return patientServiceStrategy.get(uuid)
        },
        create = function(patient, jumpAccepted) {
            return patientServiceStrategy.create(patient, jumpAccepted)
        },
        update = function(patient, openMRSPatient) {
            return patientServiceStrategy.update(patient, openMRSPatient, $rootScope.patientConfiguration.attributeTypes)
        },
        updateImage = function(uuid, image) {
            var url = baseOpenMRSRESTURL + "/personimage/",
                data = {
                    person: {
                        uuid: uuid
                    },
                    base64EncodedImage: image
                },
                config = {
                    withCredentials: !0,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    }
                };
            return $http.post(url, data, config)
        };

    var sharedData ={};
    var setData = function (data){
        sharedData = data;
    }
    var getData = function (){
        return sharedData;
    }
    var clearData = function (){
        sharedData = null;
    };
    return {
        search: search,
        searchByIdentifier: searchByIdentifier,
        create: create,
        update: update,
        get: get,
        updateImage: updateImage,
        searchByNameOrIdentifier: searchByNameOrIdentifier,
        setData: setData,
        getData: getData,
        clearData: clearData
    }
}]), angular.module("bahmni.registration").factory("patientAttributeService", ["$http", "$q", function($http, $q) {
    var urlMap, init = function() {
        urlMap = {
            personName: Bahmni.Common.Constants.bahmniSearchUrl + "/personname",
            personAttribute: Bahmni.Common.Constants.bahmniSearchUrl + "/personattribute"
        }
    };
    init();
    var search = function(fieldName, query, type) {
        var url = urlMap[type],
            queryWithoutTrailingSpaces = query.trimLeft();
        return $http.get(url, {
            method: "GET",
            params: {
                q: queryWithoutTrailingSpaces,
                key: fieldName
            },
            withCredentials: !0
        })
    };
    return {
        search: search
    }
}]), angular.module("bahmni.registration").factory("addressHierarchyService", ["$http", function($http) {
    var search = function(fieldName, query, parentUuid) {
            var params = {
                    searchString: query,
                    addressField: fieldName,
                    parentUuid: parentUuid,
                    limit: defaults.maxAutocompleteResults
                },
                url = Bahmni.Registration.Constants.openmrsUrl + "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form";
            return $http.get(url, {
                method: "GET",
                params: params,
                withCredentials: !0
            })
        },
        getNextAvailableParentName = function(addressField) {
            for (var parent = addressField.parent; parent;) {
                if (parent.name) return parent.name;
                parent = parent.parent
            }
            return ""
        },
        getAddressDataResults = function(data) {
            return data.data ? data.data.map(function(addressField) {
                var parentName = getNextAvailableParentName(addressField);
                return {
                    value: addressField.name,
                    label: addressField.name + (parentName ? ", " + parentName : ""),
                    addressField: addressField
                }
            }) : []
        };
    return {
        search: search,
        getNextAvailableParentName: getNextAvailableParentName,
        getAddressDataResults: getAddressDataResults
    }
}]), angular.module("bahmni.registration").factory("registrationCardPrinter", ["printer", function(printer) {
    var print = function(templatePath, patient, visitTypePrice, coPayment, obs, encounterDateTime) {
        templatePath = templatePath || "views/nolayoutfound.html", printer.print(templatePath, {
            patient: patient,
            today: new Date,
            visitTypePrice: visitTypePrice,
            coPayment: coPayment,
            obs: obs || {},
            encounterDateTime: encounterDateTime
        })
    };
    return {
        print: print
    }
}]), Bahmni.Common.Domain.AttributeTypeMapper = function() {
    function AttributeTypeMapper() {}
    return AttributeTypeMapper.prototype.mapFromOpenmrsAttributeTypes = function(mrsAttributeTypes, mandatoryAttributes, attributesConfig) {
        var attributeTypes = [];
        return angular.forEach(mrsAttributeTypes, function(mrsAttributeType) {
            var isRequired = function() {
                    var element = _.find(mandatoryAttributes, function(mandatoryAttribute) {
                        return mandatoryAttribute == mrsAttributeType.name
                    });
                    return !!element
                },
                attributeType = {
                    uuid: mrsAttributeType.uuid,
                    sortWeight: mrsAttributeType.sortWeight,
                    name: mrsAttributeType.name,
                    fullySpecifiedName: mrsAttributeType.name,
                    description: mrsAttributeType.description || mrsAttributeType.name,
                    format: mrsAttributeType.format || mrsAttributeType.datatypeClassname,
                    answers: [],
                    required: isRequired(),
                    concept: mrsAttributeType.concept || {},
                    excludeFrom: attributesConfig && attributesConfig[mrsAttributeType.name] && attributesConfig[mrsAttributeType.name].excludeFrom || []
                };
            attributeType.concept.dataType = attributeType.concept.datatype && attributeType.concept.datatype.name, mrsAttributeType.concept && mrsAttributeType.concept.answers && angular.forEach(mrsAttributeType.concept.answers, function(mrsAnswer) {
                var displayName = mrsAnswer.display,
                    fullySpecifiedName = mrsAnswer.display;
                mrsAnswer.names && 2 == mrsAnswer.names.length && "FULLY_SPECIFIED" == mrsAnswer.name.conceptNameType && (mrsAnswer.names[0].display == displayName ? (displayName = mrsAnswer.names[1].display, fullySpecifiedName = mrsAnswer.names[0].display) : (displayName = mrsAnswer.names[0].display, fullySpecifiedName = mrsAnswer.names[1].display)), attributeType.answers.push({
                    fullySpecifiedName: fullySpecifiedName,
                    description: displayName,
                    conceptId: mrsAnswer.uuid
                })
            }), "org.openmrs.customdatatype.datatype.RegexValidatedTextDatatype" == attributeType.format && (attributeType.pattern = mrsAttributeType.datatypeConfig), attributeTypes.push(attributeType)
        }), {
            attributeTypes: attributeTypes
        }
    }, AttributeTypeMapper
}(), Bahmni.Common.Domain.AttributeFormatter = function() {
    function AttributeFormatter() {}
    AttributeFormatter.prototype.getMrsAttributes = function(model, attributeTypes) {
        return attributeTypes.map(function(result) {
            var attribute = {
                attributeType: {
                    uuid: result.uuid
                }
            };
            return _.isEmpty(model) || setAttributeValue(result, attribute, model[result.name]), attribute
        })
    }, AttributeFormatter.prototype.getMrsAttributesForUpdate = function(model, attributeTypes, attributes) {
        return _.filter(AttributeFormatter.prototype.getMrsAttributes(model, attributeTypes), function(mrsAttribute) {
            var attribute = _.find(attributes, function(attribute) {
                return mrsAttribute.attributeType.uuid === attribute.attributeType.uuid
            });
            return attribute && !attribute.voided && (mrsAttribute.uuid = attribute.uuid), isAttributeChanged(mrsAttribute)
        })
    }, AttributeFormatter.prototype.removeUnfilledAttributes = function(formattedAttributes) {
        return _.filter(formattedAttributes, isAttributeChanged)
    };
    var isAttributeChanged = function(attribute) {
            return attribute.value || attribute.uuid
        },
        setAttributeValue = function(attributeType, attr, value) {
            if ("" === value || null === value || void 0 === value || null === value.conceptUuid) attr.voided = !0;
            else if ("org.openmrs.Concept" === attributeType.format) {
                var attrDescription = _.find(attributeType.answers, function(answer) {
                    if (answer.conceptId === value.conceptUuid) return !0
                });
                attr.value = void 0 != attrDescription ? attrDescription.description : null, attr.hydratedObject = value.conceptUuid
            } else if ("org.openmrs.util.AttributableDate" == attributeType.format || "org.openmrs.customdatatype.datatype.DateDatatype" == attributeType.format) {
                var mnt = moment(value);
                attr.value = mnt.format("YYYY-MM-DD")
            } else attr.value = value.toString()
        };
    return AttributeFormatter
}(), angular.module("bahmni.registration").factory("openmrsPatientMapper", ["patient", "$rootScope", "age", "identifiers", function(patient, $rootScope, age, identifiers) {
    var patientModel = patient,
        whereAttributeTypeExists = function(attribute) {
            return $rootScope.patientConfiguration.get(attribute.attributeType.uuid)
        },
        addAttributeToPatient = function(patient, attribute) {
            var attributeType = $rootScope.patientConfiguration.get(attribute.attributeType.uuid);
            attributeType && ("org.openmrs.Concept" === attributeType.format && attribute.value ? patient[attributeType.name] = {
                conceptUuid: attribute.value.uuid,
                value: attribute.value.display
            } : "org.openmrs.util.AttributableDate" === attributeType.format ? patient[attributeType.name] = parseDate(attribute.value) : patient[attributeType.name] = attribute.value)
        },
        mapAttributes = function(patient, attributes) {
            attributes.filter(whereAttributeTypeExists).forEach(function(attribute) {
                addAttributeToPatient(patient, attribute)
            })
        },
        parseDate = function(dateStr) {
            return Bahmni.Common.Util.DateUtil.parseServerDateToDate(dateStr)
        },
//        parseAdToBsDate = function(dateStr) {
//            var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-"),
//                bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
//            return calendarFunctions.bsDateFormat("%y %M, %d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate)
//        },
//        parseAdToBs = function(dateStr) {
//            var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-"),
//                bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
//            return calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate)
//        },

         parseAdToBsDate = function(dateStr) {
            var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-");
            var adDateObj = {
                year: parseInt(adDate[0]),
                month: parseInt(adDate[1]),
                day: parseInt(adDate[2])
            };
            var bsDate = NepaliFunctions.AD2BS(adDateObj); 
            var monthName = NepaliFunctions.BS.GetMonth(bsDate.month - 1);
            var shortYear = bsDate.year.toString().slice(-2); 
            return `${shortYear} ${monthName}, ${bsDate.day}`;
        },
        //CHANGED BY BHAWANA
        parseAdToBs = function(dateStr) {
            var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-");
            var adDateObj = {
                year: parseInt(adDate[0]),
                month: parseInt(adDate[1]),
                day: parseInt(adDate[2])
            };
            var bsDate = NepaliFunctions.AD2BS(adDateObj); 
            var formatted = NepaliFunctions.ConvertToDateFormat(bsDate, "YYYY-MM-DD");
            return formatted;
        },
        mapAddress = function(preferredAddress) {
            return preferredAddress || {}
        },
        mapRelationships = function(patient, relationships) {
            patient.relationships = relationships || [], patient.newlyAddedRelationships = [{}], patient.hasRelationships = patient.relationships.length > 0
        },
        map = function(openmrsPatient) {
            var relationships = openmrsPatient.relationships;
            openmrsPatient = openmrsPatient.patient;
            var openmrsPerson = openmrsPatient.person,
                patient = patientModel.create(),
                birthDate = parseDate(openmrsPerson.birthdate);
            return patient.uuid = openmrsPatient.uuid, patient.givenName = openmrsPerson.preferredName.givenName, patient.middleName = openmrsPerson.preferredName.middleName, patient.familyName = openmrsPerson.preferredName.familyName, patient.birthdate = birthDate ? birthDate : null, patient.birthdateBS = birthDate ? parseAdToBs(birthDate) : null, patient.age = birthDate ? age.fromBirthDate(birthDate) : null, patient.gender = openmrsPerson.gender, patient.address = mapAddress(openmrsPerson.preferredAddress), patient.birthtime = parseDate(openmrsPerson.birthtime), patient.image = Bahmni.Registration.Constants.patientImageUrlByPatientUuid + openmrsPatient.uuid + "&q=" + (new Date).toISOString(), patient.registrationDate = Bahmni.Common.Util.DateUtil.parse(openmrsPerson.auditInfo.dateCreated), patient.registrationDateBS = parseAdToBsDate(openmrsPerson.auditInfo.dateCreated), patient.dead = openmrsPerson.dead, patient.isDead = patient.dead, patient.deathDate = parseDate(openmrsPerson.deathDate), patient.deathDateBS = patient.deathDate ? parseAdToBs(patient.deathDate) : null, patient.causeOfDeath = openmrsPerson.causeOfDeath, patient.birthdateEstimated = openmrsPerson.birthdateEstimated, patient.bloodGroup = openmrsPerson.bloodGroup, mapAttributes(patient, openmrsPerson.attributes), mapRelationships(patient, relationships), _.assign(patient, identifiers.mapIdentifiers(openmrsPatient.identifiers)), patient
        };
    return {
        map: map
    }
}]), Bahmni.Registration.CreatePatientRequestMapper = function() {
    function CreatePatientRequestMapper(currentDate) {
        this.currentDate = currentDate
    }
    return CreatePatientRequestMapper.prototype.mapFromPatient = function(patientAttributeTypes, patient) {
        var constants = Bahmni.Registration.Constants,
            allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier),
            identifiers = _.filter(allIdentifiers, function(identifier) {
                return !_.isEmpty(identifier.selectedIdentifierSource) || void 0 !== identifier.identifier
            });
        identifiers = _.map(identifiers, function(identifier) {
            return {
                identifier: identifier.identifier,
                identifierSourceUuid: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.uuid : void 0,
                identifierPrefix: identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.prefix : void 0,
                identifierType: identifier.identifierType.uuid,
                preferred: identifier.preferred,
                voided: identifier.voided
            }
        });
        var openMRSPatient = {
            patient: {
                person: {
                    names: [{
                        givenName: patient.givenName,
                        middleName: patient.middleName,
                        familyName: patient.familyName,
                        display: patient.givenName + (patient.familyName ? " " + patient.familyName : ""),
                        preferred: !1
                    }],
                    addresses: [_.pick(patient.address, constants.allAddressFileds)],
                    birthdate: this.getBirthdate(patient.birthdate, patient.age),
                    birthdateEstimated: patient.birthdateEstimated,
                    gender: patient.gender,
                    birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                    personDateCreated: patient.registrationDate,
                    attributes: (new Bahmni.Common.Domain.AttributeFormatter).getMrsAttributes(patient, patientAttributeTypes),
                    dead: patient.dead,
                    deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                    causeOfDeath: patient.causeOfDeath ? patient.causeOfDeath.uuid : "",
                    uuid: patient.uuid
                },
                identifiers: identifiers,
                uuid: patient.uuid
            }
        };
        return this.setImage(patient, openMRSPatient), patient.relationships && (patient.relationships.forEach(function(relationship) {
            delete relationship.endDateBS
        }), openMRSPatient.relationships = patient.relationships), openMRSPatient
    }, CreatePatientRequestMapper.prototype.setImage = function(patient, openMRSPatient) {
        patient.getImageData() && (openMRSPatient.image = patient.getImageData())
    }, CreatePatientRequestMapper.prototype.getBirthdate = function(birthdate, age) {
        var mnt;
        return birthdate ? mnt = moment(birthdate) : void 0 !== age && (mnt = moment(this.currentDate).subtract("days", age.days).subtract("months", age.months).subtract("years", age.years)), mnt.format("YYYY-MM-DDTHH:mm:ss.SSSZZ")
    }, CreatePatientRequestMapper
}(), Bahmni.Registration.UpdatePatientRequestMapper = function() {
    var UpdatePatientRequestMapper = function(currentDate) {
        this.currentDate = currentDate
    };
    UpdatePatientRequestMapper.prototype.currentDate = void 0, UpdatePatientRequestMapper.prototype.mapFromPatient = function(patientAttributeTypes, openMRSPatient, patient) {
        var openMRSPatientProfile = {
                patient: {
                    person: {
                        names: [{
                            uuid: openMRSPatient.person.names[0].uuid,
                            givenName: patient.givenName,
                            middleName: patient.middleName,
                            familyName: patient.familyName,
                            display: patient.givenName + (patient.familyName ? " " + patient.familyName : ""),
                            preferred: !0
                        }],
                        addresses: [_.pick(patient.address, Bahmni.Registration.Constants.allAddressFileds)],
                        birthdate: this.getBirthdate(patient.birthdate, patient.age),
                        birthdateEstimated: patient.birthdateEstimated,
                        birthtime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(patient.birthtime),
                        gender: patient.gender,
                        attributes: this.getMrsAttributes(openMRSPatient, patient, patientAttributeTypes),
                        dead: patient.dead,
                        deathDate: Bahmni.Common.Util.DateUtil.getDateWithoutTime(patient.deathDate),
                        causeOfDeath: patient.causeOfDeath ? patient.causeOfDeath.uuid : ""
                    }
                }
            },
            allIdentifiers = _.concat(patient.extraIdentifiers, patient.primaryIdentifier),
            nonEmptyIdentifiers = _.filter(allIdentifiers, function(identifier) {
                return identifier.uuid || identifier.identifier
            });
        return openMRSPatientProfile.patient.identifiers = _.map(nonEmptyIdentifiers, function(identifier) {
            return {
                uuid: identifier.uuid,
                identifier: identifier.identifier,
                identifierType: identifier.identifierType.uuid,
                preferred: identifier.preferred,
                voided: identifier.voided
            }
        }), this.setImage(patient, openMRSPatientProfile), patient.relationships && (patient.relationships.forEach(function(relationship) {
            delete relationship.endDateBS
        }), openMRSPatientProfile.relationships = patient.relationships), openMRSPatientProfile
    }, UpdatePatientRequestMapper.prototype.setImage = function(patient, openMRSPatient) {
        patient.getImageData() && (openMRSPatient.image = patient.getImageData())
    }, UpdatePatientRequestMapper.prototype.getMrsAttributes = function(openMRSPatient, patient, patientAttributeTypes) {
        var attributes = [];
        return patientAttributeTypes.forEach(function(attributeType) {
            var attr = {
                    attributeType: {
                        uuid: attributeType.uuid
                    }
                },
                savedAttribute = openMRSPatient.person.attributes.filter(function(attribute) {
                    return attributeType.uuid === attribute.attributeType.uuid
                })[0];
            savedAttribute ? (attr.uuid = savedAttribute.uuid, setAttributeValue(attributeType, attr, patient[savedAttribute.attributeType.display])) : setAttributeValue(attributeType, attr, patient[attributeType.name]), attributes.push(attr)
        }), attributes
    };
    var setAttributeValue = function(attributeType, attr, value) {
        if ("" === value || null === value || void 0 === value || null === value.conceptUuid) attr.voided = !0;
        else if ("org.openmrs.Concept" === attributeType.format) attr.hydratedObject = value.conceptUuid;
        else if ("org.openmrs.util.AttributableDate" === attributeType.format) {
            var mnt = moment(value);
            attr.value = mnt.format("YYYY-MM-DDTHH:mm:ss.SSSZZ")
        } else attr.value = value.toString()
    };
    return UpdatePatientRequestMapper.prototype.getBirthdate = function(birthdate, age) {
        var mnt;
        return birthdate ? mnt = moment(birthdate) : void 0 !== age && (mnt = moment(this.currentDate).subtract("days", age.days).subtract("months", age.months).subtract("years", age.years)), mnt.format("YYYY-MM-DDTHH:mm:ss.SSSZZ")
    }, UpdatePatientRequestMapper
}(), angular.module("bahmni.registration").factory("patient", ["age", "identifiers", function(age, identifiers) {
    var create = function() {
        var calculateAge = function() {
                this.birthdate ? (this.age = age.fromBirthDate(this.birthdate), this.birthdateBS = convertDobAdToBs(this.birthdate)) : this.age = age.create(null, null, null)
            },
//            updateAdDate = function() {
//                if (this.birthdateBS) {
//                    var dateStr = this.birthdateBS.split("-"),
//                        birthdateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
//                    this.birthdate = birthdateAD
//                }
//            },
//            convertDobAdToBs = function(dateStr) {
//                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-"),
//                    bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
//                return calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate)
//            },
//            updateAdDate = function() {
//                if (this.birthdateBS) {
//                    var dateStr = this.birthdateBS.split("-"),
//                        birthdateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
//                    this.birthdate = birthdateAD
//                }
//            },
//            convertDobAdToBs = function(dateStr) {
//                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-"),
//                    bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
//                return calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate)
//            },

            updateAdDate = function() {
                if (this.birthdateBS) {
                    var dateStr = NepaliFunctions.ConvertToNumber(this.birthdateBS); 
                    var bsDateObj = NepaliFunctions.ConvertToDateObject(dateStr, "YYYY-MM-DD"); 
                    var adDate = NepaliFunctions.BS2AD(bsDateObj); 
                    this.birthdate = NepaliFunctions.ConvertToDateFormat(adDate, "YYYY-MM-DD");
                }
            },
            convertDobAdToBs = function(dateStr) {
                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-");
                var adDateObj = {
                    year: parseInt(adDate[0]),
                    month: parseInt(adDate[1]),
                    day: parseInt(adDate[2])
                };
                var bsDate = NepaliFunctions.AD2BS(adDateObj); 
                var formatted = NepaliFunctions.ConvertToDateFormat(bsDate, "YYYY-MM-DD");
                return NepaliFunctions.ConvertToUnicode(formatted); 
            },
            updateAdDate = function() {
                if (this.birthdateBS) {
                    var dateStr = NepaliFunctions.ConvertToNumber(this.birthdateBS); 
                    var bsDateObj = NepaliFunctions.ConvertToDateObject(dateStr, "YYYY-MM-DD"); 
                    var adDate = NepaliFunctions.BS2AD(bsDateObj);
                    this.birthdate = NepaliFunctions.ConvertToDateFormat(adDate, "YYYY-MM-DD"); 
                }
            },
            convertDobAdToBs = function(dateStr) {
                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-");
                var adDateObj = {
                    year: parseInt(adDate[0]),
                    month: parseInt(adDate[1]),
                    day: parseInt(adDate[2])
                };
                var bsDate = NepaliFunctions.AD2BS(adDateObj); 
                var formatted = NepaliFunctions.ConvertToDateFormat(bsDate, "YYYY-MM-DD");
                return NepaliFunctions.ConvertToUnicode(formatted); 
            },
            calculateBirthDate = function() {
                this.birthdate = age.calculateBirthDate(this.age), this.birthdateBS = convertDobAdToBs(this.birthdate)
            },
            fullNameLocal = function() {
                var givenNameLocal = this.givenNameLocal || this.givenName || "",
                    middleNameLocal = this.middleNameLocal || this.middleName || "",
                    familyNameLocal = this.familyNameLocal || this.familyName || "";
                return (givenNameLocal.trim() + " " + (middleNameLocal ? middleNameLocal + " " : "") + familyNameLocal.trim()).trim()
            },
            getImageData = function() {
                return this.image && 0 === this.image.indexOf("data") ? this.image.replace("data:image/jpeg;base64,", "") : null
            },
            identifierDetails = identifiers.create(),
            patient = {
                address: {},
                age: age.create(),
                birthdate: null,
                calculateAge: calculateAge,
                image: "../images/blank-user.gif",
                fullNameLocal: fullNameLocal,
                getImageData: getImageData,
                relationships: [],
                newlyAddedRelationships: [{}],
                deletedRelationships: [],
                calculateBirthDate: calculateBirthDate,
                updateAdDate: updateAdDate
            };
        return _.assign(patient, identifierDetails)
    };
    return {
        create: create
    }
}]), Bahmni.Registration.Identifier = function(identifierType) {
    return this.identifierType = identifierType, this.preferred = identifierType.primary, this.voided = !1, this
};
var prototype = Bahmni.Registration.Identifier.prototype;
prototype.hasIdentifierSources = function() {
    return this.identifierType.identifierSources.length > 0
}, prototype.isPrimary = function() {
    return this.identifierType.primary
}, prototype.map = function(identifiers) {
    var savedIdentifier = _.find(identifiers, {
        identifierType: {
            uuid: this.identifierType.uuid
        }
    });
    return savedIdentifier && (this.registrationNumber = savedIdentifier.identifier, this.identifier = savedIdentifier.identifier, this.preferred = savedIdentifier.preferred, this.voided = savedIdentifier.voided, this.uuid = savedIdentifier.uuid), this
}, prototype.hasIdentifierSourceWithEmptyPrefix = function() {
    var identifierSources = this.identifierType.identifierSources;
    return 1 === identifierSources.length && _.isEmpty(identifierSources[0].prefix)
}, prototype.isIdentifierRequired = function() {
    return !!this.hasOldIdentifier || !!this.identifierType.required && !this.hasIdentifierSources()
}, prototype.generate = function() {
    this.registrationNumber && this.registrationNumber.length > 0 ? (this.identifier = this.selectedIdentifierSource ? this.selectedIdentifierSource.prefix + this.registrationNumber : this.registrationNumber, this.voided = !1) : this.uuid && (this.voided = !0)
}, prototype.clearRegistrationNumber = function() {
    this.registrationNumber = null, this.identifier = null
}, angular.module("bahmni.registration").factory("identifiers", ["$rootScope", "preferences", function($rootScope, preferences) {
    var create = function() {
            var identifiers = [];
            return _.each($rootScope.patientConfiguration.identifierTypes, function(identifierType) {
                var identifier = new Bahmni.Registration.Identifier(identifierType);
                identifier.isPrimary() && (identifier.selectedIdentifierSource = _.find(identifier.identifierType.identifierSources, {
                    prefix: preferences.identifierPrefix
                }), identifier.hasOldIdentifier = preferences.hasOldIdentifier), identifier.selectedIdentifierSource = identifier.selectedIdentifierSource || identifier.identifierType.identifierSources[0], identifiers.push(identifier)
            }), {
                primaryIdentifier: getPrimaryIdentifier(identifiers),
                extraIdentifiers: getExtraIdentifiers(identifiers)
            }
        },
        mapIdentifiers = function(identifiers) {
            var mappedIdentifiers = [];
            return _.each($rootScope.patientConfiguration.identifierTypes, function(identifierType) {
                var mappedIdentifier = new Bahmni.Registration.Identifier(identifierType).map(identifiers);
                mappedIdentifiers.push(mappedIdentifier)
            }), {
                primaryIdentifier: getPrimaryIdentifier(mappedIdentifiers),
                extraIdentifiers: getExtraIdentifiers(mappedIdentifiers)
            }
        },
        getPrimaryIdentifier = function(identifiers) {
            return _.find(identifiers, {
                identifierType: {
                    primary: !0
                }
            })
        },
        getExtraIdentifiers = function(identifiers) {
            return _.filter(identifiers, {
                identifierType: {
                    primary: !1
                }
            })
        };
    return {
        create: create,
        mapIdentifiers: mapIdentifiers
    }
}]), angular.module("bahmni.registration").factory("preferences", [function() {
    return {
        hasOldIdentifier: !1
    }
}]), Bahmni.Registration.RegistrationEncounterConfig = function() {
    function RegistrationEncounterConfig(conceptData, encounterTypes, visitTypes) {
        this.conceptData = conceptData, this.encounterTypes = encounterTypes, this.visitTypes = visitTypes
    }
    return RegistrationEncounterConfig.prototype = {
        getVisitTypesAsArray: function() {
            var visitTypesArray = [];
            for (var name in this.visitTypes) visitTypesArray.push({
                name: name,
                uuid: this.visitTypes[name]
            });
            return visitTypesArray
        },
        getDefaultVisitType: function(locationUuid) {
            var visitType = null;
            return _.each(this.loginLocationToVisitTypeMap.results, function(result) {
                result.entity.uuid === locationUuid && (visitType = result.mappings[0].name)
            }), visitType
        }
    }, RegistrationEncounterConfig
}(), Bahmni.Registration.PatientConfig = function() {
    function PatientConfig(patientAttributeTypes, identifierTypes, patientInformation) {
        this.attributeTypes = patientAttributeTypes, this.identifierTypes = identifierTypes;
        var patientAttributesSections = {};
        if (!this.attributeRows && this.attributeTypes) {
            if (!patientInformation) return void(this.attributeRows = this.splitAsRows(this.attributeTypes));
            var hiddenAttributes = patientInformation.hidden && patientInformation.hidden.attributes;
            delete patientInformation.hidden;
            var otherInformationAttributes = this.attributeTypes.filter(function(item) {
                return !isHiddenPatientAttribute(hiddenAttributes, item) && !isItemAMandatoryField(item) && !isAttributeInOtherSection(patientInformation, patientAttributesSections, item)
            });
            this.attributeRows = this.splitAsRows(otherInformationAttributes), this.patientAttributesSections = patientAttributesSections
        }
    }

    function isHiddenPatientAttribute(hiddenAttributes, item) {
        return hiddenAttributes && hiddenAttributes.indexOf(item.name) > -1
    }

    function isAttributeInOtherSection(patientInformation, patientAttributesSections, item) {
        return _.find(patientInformation, function(section, key) {
            return _.find(section.attributes, function(attribute) {
                if (attribute === item.name) {
                    var sectionObject = patientAttributesSections[key];
                    return sectionObject || (sectionObject = {
                        attributes: [],
                        title: section.title,
                        expanded: section.expanded,
                        translationKey: section.translationKey,
                        shortcutKey: section.shortcutKey,
                        order: section.order,
                        canShow: !0
                    }), sectionObject.attributes.push(item), patientAttributesSections[key] = sectionObject, !0
                }
                return !1
            })
        })
    }

    function isItemAMandatoryField(item) {
        var mandatoryPatientAttributes = ["healthCenter", "givenNameLocal", "middleNameLocal", "familyNameLocal"];
        return mandatoryPatientAttributes.indexOf(item.name) > -1
    }
    return PatientConfig.prototype = {
        get: function(attributeUuid) {
            return this.attributeTypes.filter(function(item) {
                return item.uuid === attributeUuid
            })[0]
        },
        customAttributeRows: function() {
            return this.attributeRows
        },
        getPatientAttributesSections: function() {
            return this.patientAttributesSections
        },
        getOrderedPatientAttributesSections: function() {
            return _.sortBy(this.patientAttributesSections, "order")
        },
        splitAsRows: function(attributes) {
            var attributeRows = [],
                row = [];
            for (var i in attributes) row.push(attributes[i]), 0 !== i && i % 2 !== 0 && (attributeRows.push(row), row = []);
            return row.length > 0 && attributeRows.push(row), attributeRows
        },
        heathCentreAttribute: function() {
            return this.attributeTypes.filter(function(item) {
                return "healthCenter" === item.name
            })[0]
        },
        local: function() {
            var givenName = this.attributeTypes.filter(function(item) {
                    return "givenNameLocal" === item.name
                })[0],
                middleName = this.attributeTypes.filter(function(item) {
                    return "middleNameLocal" === item.name
                })[0],
                familyName = this.attributeTypes.filter(function(item) {
                    return "familyNameLocal" === item.name
                })[0];
            return givenName && middleName && familyName ? {
                showNameField: !0,
                labelForNameField: givenName.description,
                placeholderForGivenName: givenName.description,
                placeholderForMiddleName: middleName.description,
                placeholderForFamilyName: familyName.description
            } : {
                showNameField: !1
            }
        }
    }, PatientConfig
}();
var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {}, Bahmni.Common.PatientSearch = Bahmni.Common.PatientSearch || {}, Bahmni.Common.PatientSearch.Constants = {
    searchExtensionTileViewType: "tile",
    searchExtensionTabularViewType: "tabular",
    tabularViewIgnoreHeadingsList: ["display", "uuid", "image", "$$hashKey", "activeVisitUuid", "hasBeenAdmitted", "forwardUrl", "programUuid", "enrollment"],
    identifierHeading: ["ID", "Id", "id", "identifier", "DQ_COLUMN_TITLE_ACTION"],
    nameHeading: ["NAME", "Name", "name"],
    orderPlacedOnHeading: "Order Placed on",
    patientTileHeight: 100,
    patientTileWidth: 100,
    printIgnoreHeadingsList: ["DQ_COLUMN_TITLE_ACTION"],
    tileLoadRatio: .5
}, Bahmni.Common.PatientSearch.Search = function(searchTypes) {
    function mapPatient(patient) {
        return (patient.name || patient.givenName || patient.familyName) && (patient.name = patient.name || patient.givenName + (patient.familyName ? " " + patient.familyName : "")), patient.display = _.map(self.searchColumns, function(column) {
            return patient[column]
        }).join(" - "), patient.image = Bahmni.Common.Constants.patientImageUrlByPatientUuid + patient.uuid, patient
    }
    var self = this;
    self.searchTypes = searchTypes || [], self.searchType = this.searchTypes[0], self.searchParameter = "", self.noResultsMessage = null, self.searchResults = [], self.activePatients = [], self.navigated = !1, self.links = self.searchType && self.searchType.links ? self.searchType.links : [], self.searchColumns = self.searchType && self.searchType.searchColumns ? self.searchType.searchColumns : ["identifier", "name"], angular.forEach(searchTypes, function(searchType) {
        searchType.patientCount = "..."
    }), self.switchSearchType = function(searchType) {
        self.noResultsMessage = null, self.isSelectedSearch(searchType) || (self.searchParameter = "", self.navigated = !0, self.searchType = searchType, self.activePatients = [], self.searchResults = [], self.links = self.searchType && self.searchType.links ? self.searchType.links : [], self.searchColumns = self.searchType && self.searchType.searchColumns ? self.searchType.searchColumns : ["identifier", "name"]), self.markPatientEntry()
    }, self.markPatientEntry = function() {
        self.startPatientSearch = !0, window.setTimeout(function() {
            self.startPatientSearch = !1
        })
    }, self.patientsCount = function() {
        return self.activePatients.length
    }, self.updatePatientList = function(patientList) {
        self.activePatients = patientList.map(mapPatient), self.searchResults = self.activePatients
    }, self.updateSearchResults = function(patientList) {
        self.updatePatientList(patientList), 0 === self.activePatients.length && "" != self.searchParameter ? self.noResultsMessage = "NO_RESULTS_FOUND" : self.noResultsMessage = null
    }, self.hasSingleActivePatient = function() {
        return 1 === self.activePatients.length
    }, self.filterPatients = function(matchingCriteria) {
        matchingCriteria = matchingCriteria ? matchingCriteria : matchesNameOrId, self.searchResults = self.searchParameter ? self.activePatients.filter(matchingCriteria) : self.activePatients
    }, self.filterPatientsByIdentifier = function() {
        self.filterPatients(matchesId)
    }, self.isSelectedSearch = function(searchType) {
        return self.searchType && self.searchType.id == searchType.id
    }, self.isCurrentSearchLookUp = function() {
        return self.searchType && self.searchType.handler
    }, self.isTileView = function() {
        return self.searchType && self.searchType.view === Bahmni.Common.PatientSearch.Constants.searchExtensionTileViewType
    }, self.isTabularView = function() {
        return self.searchType && self.searchType.view === Bahmni.Common.PatientSearch.Constants.searchExtensionTabularViewType
    }, self.showPatientCountOnSearchParameter = function(searchType) {
        return showPatientCount(searchType) && self.searchParameter
    };
    var matchesNameOrId = function(patient) {
            return patient.display.toLowerCase().indexOf(self.searchParameter.toLowerCase()) !== -1
        },
        matchesId = function(patient) {
            return patient.identifier.toLowerCase().indexOf(self.searchParameter.toLowerCase()) !== -1
        },
        showPatientCount = function(searchType) {
            return self.isSelectedSearch(searchType) && self.isCurrentSearchLookUp()
        }
}, angular.module("bahmni.common.patientSearch", ["bahmni.common.patient", "infinite-scroll"]), angular.module("bahmni.common.patientSearch").controller("PatientsListController", ["$scope", "$window", "patientService", "$rootScope", "appService", "spinner", "$stateParams", "$bahmniCookieStore", "printer", "configurationService", function($scope, $window, patientService, $rootScope, appService, spinner, $stateParams, $bahmniCookieStore, printer, configurationService) {
    const DEFAULT_FETCH_DELAY = 2e3;
    var patientListSpinner, patientSearchConfig = appService.getAppDescriptor().getConfigValue("patientSearch"),
        initialize = function() {
            var searchTypes = appService.getAppDescriptor().getExtensions("org.bahmni.patient.search", "config").map(mapExtensionToSearchType);
            $scope.search = new Bahmni.Common.PatientSearch.Search(_.without(searchTypes, void 0)), $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue("displayNepaliDates"), $scope.search.markPatientEntry(), $scope.$watch("search.searchType", function(currentSearchType) {
                _.isEmpty(currentSearchType) || fetchPatients(currentSearchType)
            }), $scope.$watch("search.activePatients", function(activePatientsList) {
                activePatientsList.length > 0 && patientListSpinner && hideSpinner(spinner, patientListSpinner, $(".tab-content"))
            }), patientSearchConfig && patientSearchConfig.serializeSearch ? getPatientCountSeriallyBySearchIndex(0) : _.each($scope.search.searchTypes, function(searchType) {
                _.isEmpty(searchType) || $scope.search.searchType != searchType && getPatientCount(searchType, null)
            }), null != $rootScope.currentSearchType && $scope.search.switchSearchType($rootScope.currentSearchType), configurationService.getConfigurations(["identifierTypesConfig"]).then(function(response) {
                $scope.primaryIdentifier = _.find(response.identifierTypesConfig, {
                    primary: !0
                }).name
            })
        };
    $scope.searchPatients = function() {
        return spinner.forPromise(patientService.search($scope.search.searchParameter)).then(function(response) {
            $scope.search.updateSearchResults(response.data.pageOfResults), $scope.search.hasSingleActivePatient() && $scope.forwardPatient($scope.search.activePatients[0])
        })
    }, $scope.filterPatientsAndSubmit = function() {
        1 == $scope.search.searchResults.length && $scope.forwardPatient($scope.search.searchResults[0])
    };
    var getPatientCount = function(searchType, patientListSpinner) {
            if (searchType.handler) {
                var params = {
                    q: searchType.handler,
                    v: "full",
                    location_uuid: $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid,
                    provider_uuid: $rootScope.currentProvider.uuid
                };
                searchType.additionalParams && (params.additionalParams = searchType.additionalParams), patientService.findPatients(params).then(function(response) {
                    searchType.patientCount = response.data.length, $scope.search.isSelectedSearch(searchType) && $scope.search.updatePatientList(response.data), patientListSpinner && hideSpinner(spinner, patientListSpinner, $(".tab-content"))
                })
            }
        },
        hideSpinner = function(spinnerObj, data, container) {
            spinnerObj.hide(data, container), $(container).children("patient-list-spinner").hide()
        };
    $scope.getHeadings = function(patients) {
        if (patients && patients.length > 0) {
            var headings = _.chain(patients[0]).keys().filter(function(heading) {
                return _.indexOf(Bahmni.Common.PatientSearch.Constants.tabularViewIgnoreHeadingsList, heading) === -1
            }).value();
            return headings
        }
        return []
    }, $scope.isHeadingOfLinkColumn = function(heading) {
        var identifierHeading = _.includes(Bahmni.Common.PatientSearch.Constants.identifierHeading, heading);
        return identifierHeading ? identifierHeading : $scope.search.searchType && $scope.search.searchType.links ? _.find($scope.search.searchType.links, {
            linkColumn: heading
        }) : $scope.search.searchType && $scope.search.searchType.linkColumn ? _.includes([$scope.search.searchType.linkColumn], heading) : void 0
    }, $scope.isHeadingOfName = function(heading) {
        return _.includes(Bahmni.Common.PatientSearch.Constants.nameHeading, heading)
    }, $scope.getPrintableHeadings = function(patients) {
        var headings = $scope.getHeadings(patients),
            printableHeadings = headings.filter(function(heading) {
                return _.indexOf(Bahmni.Common.PatientSearch.Constants.printIgnoreHeadingsList, heading) === -1
            });
        return printableHeadings
    }, $scope.printPage = function() {
        null != $scope.search.searchType.printHtmlLocation && printer.printFromScope($scope.search.searchType.printHtmlLocation, $scope)
    };
    var mapExtensionToSearchType = function(appExtn) {
            return {
                name: appExtn.label,
                display: appExtn.extensionParams.display,
                handler: appExtn.extensionParams.searchHandler,
                forwardUrl: appExtn.extensionParams.forwardUrl,
                id: appExtn.id,
                params: appExtn.extensionParams.searchParams,
                refreshTime: appExtn.extensionParams.refreshTime || 0,
                view: appExtn.extensionParams.view || Bahmni.Common.PatientSearch.Constants.searchExtensionTileViewType,
                showPrint: appExtn.extensionParams.showPrint || !1,
                printHtmlLocation: appExtn.extensionParams.printHtmlLocation || null,
                additionalParams: appExtn.extensionParams.additionalParams,
                searchColumns: appExtn.extensionParams.searchColumns,
                translationKey: appExtn.extensionParams.translationKey,
                linkColumn: appExtn.extensionParams.linkColumn,
                links: appExtn.extensionParams.links
            }
        },
        debounceGetPatientCount = _.debounce(function(currentSearchType, patientListSpinner) {
            getPatientCount(currentSearchType, patientListSpinner)
        }, patientSearchConfig && patientSearchConfig.fetchDelay || DEFAULT_FETCH_DELAY, {}),
        showSpinner = function(spinnerObj, container) {
            return $(container).children("patient-list-spinner").show(), spinnerObj.show(container)
        },
        fetchPatients = function(currentSearchType) {
            void 0 !== patientListSpinner && hideSpinner(spinner, patientListSpinner, $(".tab-content")), $rootScope.currentSearchType = currentSearchType, $scope.search.isCurrentSearchLookUp() && (patientListSpinner = showSpinner(spinner, $(".tab-content")), patientSearchConfig && patientSearchConfig.debounceSearch ? debounceGetPatientCount(currentSearchType, patientListSpinner) : getPatientCount(currentSearchType, patientListSpinner))
        };
    $scope.forwardPatient = function(patient, heading) {
        var options = $.extend({}, $stateParams);
        $rootScope.patientAdmitLocationStatus = patient.Status, $.extend(options, {
            patientUuid: patient.uuid,
            visitUuid: patient.activeVisitUuid || null,
            encounterUuid: $stateParams.encounterUuid || "active",
            programUuid: patient.programUuid || null,
            enrollment: patient.enrollment || null,
            forwardUrl: patient.forwardUrl || null,
            dateEnrolled: patient.dateEnrolled || null
        });
        var link = options.forwardUrl ? {
            url: options.forwardUrl,
            newTab: !0
        } : {
            url: $scope.search.searchType.forwardUrl,
            newTab: !1
        };
        $scope.search.searchType.links && (link = _.find($scope.search.searchType.links, {
            linkColumn: heading
        }) || link), link.url && null !== link.url && $window.open(appService.getAppDescriptor().formatUrl(link.url, options, !0), link.newTab ? "_blank" : "_self")
    };
    var getPatientCountSeriallyBySearchIndex = function(index) {
        if (index !== $scope.search.searchTypes.length) {
            var searchType = $scope.search.searchTypes[index];
            if (searchType.handler) {
                var params = {
                    q: searchType.handler,
                    v: "full",
                    location_uuid: $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid,
                    provider_uuid: $rootScope.currentProvider.uuid
                };
                searchType.additionalParams && (params.additionalParams = searchType.additionalParams), patientService.findPatients(params).then(function(response) {
                    return searchType.patientCount = response.data.length, $scope.search.isSelectedSearch(searchType) && $scope.search.updatePatientList(response.data), getPatientCountSeriallyBySearchIndex(index + 1)
                })
            }
        }
    };
    initialize()
}]);