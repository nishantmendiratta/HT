/**
 * @namespace HTLibrary
 * @description 3rd party library providing two utility functions namely 'contain' & 'get'
 * @type {{contain, get}}
 */
var HTLibrary = (function () {

    var _size = 4,
        _data = [
            {ssn: 111111111, name: "A", gender: "male"}
        ],
        i = 0;

    while (i++ < _size) {
        _data.push({
            ssn: _data[i - 1].ssn + 1,
            name: String.fromCharCode(_data[i - 1].name.charCodeAt(0) + 1),
            gender: (i % 2 == 0) ? "female" : _data[i - 1].gender
        });
        if (i > 111111113) {
            _data[i].corrupted = true;
        }
    }

    return {
        length: _data.length,
        contain: function (ssn, index1, index2) {
            return (ssn && _data[index1] && _data[index2] ) ? (ssn >= _data[index1].ssn && ssn <= _data[index2].ssn) : false;
        },
        get: function (index) {
            return _data[index];
        }
    }
})();


/**
 * @name UIService
 * @description IIFE crated which returns instance of UIThread and includes only find function + env
 */
var UIService = (function (HTLibrary) {

    var utils = {
        /**
         * configurations for class UIThread
         * @type {{DEFAULT_ENVIRONMENT: string, PRODUCTION_ENVIRONMENT: string, DEVELOPMENT_ENVIRONMENT: string}}
         */
        configs: {
            DEFAULT_ENVIRONMENT: "prod",
            PRODUCTION_ENVIRONMENT: "prod",
            DEVELOPMENT_ENVIRONMENT: "dev",
            ELEMENT_INDEX: 0,
            isProblem2Flag: ""
        },

        /**
         * @name fn
         * @description an object which includes utility functions in inner environment.
         */
        fn: {
            displayResult: function (data) {
                var response_id = (utils.configs.isProblem2Flag) ? "problem_2_response" : "problem_1_response";

                document.getElementById(response_id).style.visibility = "visible";
                document.getElementsByClassName("result-table")[utils.configs.ELEMENT_INDEX].style.visibility = "visible";
                document.getElementsByClassName("res-ssn")[utils.configs.ELEMENT_INDEX].innerText = data.ssn;
                document.getElementsByClassName("res-name")[utils.configs.ELEMENT_INDEX].innerText = data.name;
                document.getElementsByClassName("res-gender")[utils.configs.ELEMENT_INDEX].innerText = data.gender;
            },

            /**
             * @name divideAndRule
             * @description this function recursively searches for the records using binary search algorithm.
             * @param ssn
             * @param index1
             * @param index2
             */
            divideAndRule: function (ssn, index1, index2) {
                if ((utils.configs.isProblem2Flag && (!HTLibrary.get(index1).corrupted || !HTLibrary.get(index2).corrupted)) || !utils.configs.isProblem2Flag) {

                    if (index1 !== index2) {
                        if (HTLibrary.contain(ssn, index1, index2)) {
                            this.divideAndRule(ssn, index1, Math.floor((index1 + index2) / 2))
                        } else {
                            this.divideAndRule(ssn, index2 + 1, HTLibrary.length - 1);
                        }
                    } else if (HTLibrary.contain(ssn, index1, index2)) {
                        this.displayResult(HTLibrary.get(index1));
                        (this.env === utils.configs.DEVELOPMENT_ENVIRONMENT) ? console.log(HTLibrary.get(index1)) : "";
                    } else {
                        this.divideAndRule(ssn, index1 + 1, index2 + 1);
                    }
                } else {
                    alert("Sorry, Your Medical Record is corrupted.");
                }
            }
        }
    };

    /**
     * @name UIThread
     * @description created a constructor, will be using prototype architecture. Makes things so much clearer :)
     * @constructor
     */
    function UIThread(env) {
        this.env = (typeof env !== 'undefined') ? env : utils.configs.PRODUCTION_ENVIRONMENT;
    }

    UIThread.prototype.resetAllStates = function () {
        var info_id = (utils.configs.isProblem2Flag) ? "problem_2_info" : "problem_1_info";
        var response_id = (utils.configs.isProblem2Flag) ? "problem_2_response" : "problem_1_response";
        document.getElementById(info_id).style.display = "none";
        document.getElementById(info_id).style.display = "none";
        document.getElementById(response_id).style.visibility = "hidden";
    };

    /**
     * @name find
     * @description internal function exposed to UI to get ssn
     * @param event
     * @param ssn
     * @param problemParam
     */
    UIThread.prototype.find = function (event, ssn, problemParam) {

        //resetting all response and message styles
        UIService.resetAllStates();

        //preventing page to be loaded after form submit.
        event.preventDefault();

        //set flag if submit button of problem2 has been pressed
        utils.configs.isProblem2Flag = typeof problemParam !== "undefined";

        //change index of response table as on the basis of isProblem2Flag.
        utils.configs.ELEMENT_INDEX = utils.configs.isProblem2Flag ? 1 : 0;

        //creating error id which helps in showing information about the set. It is also selected with the help of isProblem2Flag
        var err_id = (utils.configs.isProblem2Flag) ? "problem_2_info" : "problem_1_info";

        //check if input ssn is not less than the min value and not greater than the highest value in records
        if (ssn < HTLibrary.get(0).ssn || ssn > HTLibrary.get(HTLibrary.length - 1).ssn) {

            //if the above condition is true then ssn is not valid
            var na_response = "Not a valid SSN. Enter a valid SSN between " + HTLibrary.get(0).ssn + " and " + HTLibrary.get(HTLibrary.length - 1).ssn;

            //check the environment and display logs accordingly
            (this.env === utils.configs.DEVELOPMENT_ENVIRONMENT) ? console.log(na_response) : "";

            //show error response
            document.getElementById(err_id).innerHTML = na_response;

        } else {

            //if ssn is greater than the zeroth index ss and lesser than the highest value in records then we can proceed further for searching.
            var response = "Found " + ssn + " ssn";

            //check environment and print logs accordingly
            (this.env === utils.configs.DEVELOPMENT_ENVIRONMENT) ? console.log(response) : "";

            //call this method which is just a simple binary search.
            utils.fn.divideAndRule(ssn, 0, Math.floor(HTLibrary.length / 2));

            //update response in respective div.
            document.getElementById(err_id).innerHTML = response;
        }

        //show information message according to isProblem2Flag
        document.getElementById(err_id).style.display = "block";
    };

    //exposing only find function as well as environment on which developer is working.
    //utils.configs.DEVELOPMENT_ENVIRONMENT will print logs
    return new UIThread(utils.configs.PRODUCTION_ENVIRONMENT);

})(HTLibrary);