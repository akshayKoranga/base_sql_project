let express = require('express');

module.exports = function users() {

    let api = express.Router();
    // -----------------------define all dependencies -----------------
    let {
        //-------module------------------
        bcrypt,
        //---- base service functions--------
        constants,
        // ----------------Middleware------------------------
        upload,
        authmiddleware,
        request,
        //-------------helper function-------------
        textLocal_send_message,
        notificationLocalSchema,
        //---------  Define models---------------
        userModel,
        // -------- Define services ----------
        userService,
        notificationLocalService
    } = require('../services/baseService');
    //------------------------ end of dependencies -------------------

    // User Registration:- /v1/user/:lang/register
    const Upload = upload.fields([{
        name: 'user_profile_pic'
    }]);


    //=======================================================================================================//
    //*
    //*                                 Insert user (Post)
    //*                          Desc = This Api Insert new user   
    //========================================================================================================//
    api.post('/:lang/register', Upload, (req, res) => {
        const {
            body
        } = req;
        // File uploaded/not sent
        //req.body['user_profile_pic'] = req.file ? req.file.filename ? req.file.filename : '' : '';

        if (userService.userValidations.validateUserSignup(body) === 1) {
            let statusCode = new constants.response().PARAMETER_MISSING;
            return res.json(constants.response.sendFailure('MANDATORY_PARAMETER_MISSING', req.params.lang, statusCode));
        }

        var finduser = userService.UserSchema
            .findOne({
                where: {
                    user_email: body.user_email,
                },
            }).then(user_data => {
                if (user_data) {
                    let statusCode = new constants.response().VALUE_NOT_UNIQUE;
                    return res.json(constants.response.sendFailure('EMAIL_ALREADY_EXISTS', req.params.lang, statusCode));
                } else {
                    let userDetails = request.parseRequestBody(body, userService.userParams);
                    if (!req.files.user_profile_pic) {
                        var image = '';
                    } else {
                        var image = req.files.user_profile_pic[0].key;
                    }

                    const user = userService.UserSchema.create({
                        user_email: userDetails.user_email,
                        user_password: userDetails.user_password,
                        user_first_name: userDetails.user_first_name,
                        user_last_name: userDetails.user_last_name,
                        user_lat: userDetails.user_lat,
                        user_long: userDetails.user_long,
                        user_timezone: userDetails.user_timezone,
                        user_address: userDetails.user_address,
                        user_city: userDetails.user_city,
                        user_state: userDetails.user_state,
                        user_country: userDetails.user_country,
                        user_zipcode: userDetails.user_zipcode,
                        user_phone_no: userDetails.user_phone_no,
                        user_device_type: userDetails.user_device_type,
                        user_device_token: userDetails.user_device_token,
                        user_profile_pic: image,
                    }).then(function (item) {
                        var payload_obj = {
                            user_id: item.user_id,
                            user_role: new constants.userRole().USER,
                        };
                        var token = authmiddleware.authenticate(payload_obj);
                        item.dataValues.token = token;
                        item.dataValues.cart_count = '0';

                        delete item.dataValues['user_password'];
                        return res.json(constants.response.sendSuccess('USER_SIGNUP_SUCCESS', item, req.params.lang));

                    }).catch(function (err) {
                        console.log(err)
                        let statusCode = new constants.response().SERVER_ERROR;
                        return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));

                    });
                }
            }).catch(function (err) {
                console.log(err)
                let statusCode = new constants.response().SERVER_ERROR;
                return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));

            });
    });
    //************************************* End of Register user ************************************** */



    // User login:- /v1/user/:lang/login
    api.post('/:lang/login', Upload, (req, res) => {
        const {
            body
        } = req;
        if (body.user_social_sign_type !== undefined && body.user_social_sign_id != '0' && body.user_social_sign_id != '') {

            var finduser = userService.UserSchema
                .findOne({
                    //attributes: { exclude: ["user_password"] },
                    where: {
                        user_social_sign_id: body.user_social_sign_id,
                        user_social_sign_type: body.user_social_sign_type
                    },
                    //required: false
                }).then(user_data => {
                    if (user_data == null) {
                        let userDetails = request.parseRequestBody(body, userService.userParams);
                        //---------- insert user ------------------------
                        if (!req.files.user_profile_pic) {
                            var image = '';
                        } else {
                            var image = req.files.user_profile_pic[0].key;
                        }
                        const user = userService.UserSchema.create({
                            user_email: userDetails.user_email,
                            user_first_name: userDetails.user_first_name,
                            user_last_name: userDetails.user_last_name,
                            user_lat: userDetails.user_lat,
                            user_long: userDetails.user_long,
                            user_timezone: userDetails.user_timezone,
                            user_address: userDetails.user_address,
                            user_city: userDetails.user_city,
                            user_state: userDetails.user_state,
                            user_country: userDetails.user_country,
                            user_zipcode: userDetails.user_zipcode,
                            user_phone_no: userDetails.user_phone_no,
                            user_device_type: userDetails.user_device_type,
                            user_device_token: userDetails.user_device_token,
                            user_profile_pic: image,
                            user_social_sign_type: body.user_social_sign_type,
                            user_social_sign_id: body.user_social_sign_id
                        }).then(function (item) {
                            var payload_obj = {
                                user_id: item.user_id,
                                user_role: new constants.userRole().USER,
                            };
                            var token = authmiddleware.authenticate(payload_obj);
                            item.dataValues.token = token;
                            return res.json(constants.response.sendSuccess('USER_SIGNUP_SUCCESS', item, req.params.lang));

                        }).catch(function (err) {
                            console.log(err)
                            let statusCode = new constants.response().ALREADY_EXIST;
                            return res.json(constants.response.sendFailure('EMAIL_ALREADY_EXISTS', req.params.lang, statusCode));

                        });
                    } else {
                        var payload_obj = {
                            user_id: user_data.user_id,
                            user_role: new constants.userRole().USER,
                        };
                        var token = authmiddleware.authenticate(payload_obj);
                        user_data.dataValues.cart_count = '0';
                        user_data.dataValues.token = token;
                        // ------- delete specific key from obj ------
                        delete user_data.dataValues['user_password'];
                        return res.json(constants.response.sendSuccess('USER_LOGIN_SUCCESS', user_data, req.params.lang));
                    }
                    //----------- Define variable if undefined set old value else new value
                }).catch(err => {
                    console.log(err)
                    let statusCode = new constants.response().NOT_FOUND;
                    return res.json(constants.response.sendFailure('USER_LOGIN_FAILURE', req.params.lang, statusCode));
                })
        } else {

            if (userService.userValidations.validateUserLogin(req.body) === 1) {
                let statusCode = new constants.response().PARAMETER_MISSING;
                return res.json(constants.response.sendFailure('MANDATORY_PARAMETER_MISSING', req.params.lang, statusCode));
            }
            //----------------------------------------------------

            var finduser = userService.UserSchema
                .findOne({
                    //attributes: { exclude: ["user_password"] },
                    where: {
                        user_email: body.user_email,
                    },
                    //required: false
                }).then(user_data => {
                    console.log(req.body.user_password)
                    let correctPwd = bcrypt.compareSync(req.body.user_password, user_data.user_password);
                    console.log(correctPwd)
                    if (correctPwd) {
                        var payload_obj = {
                            user_id: user_data.user_id,
                            user_role: new constants.userRole().USER,
                        };
                        var token = authmiddleware.authenticate(payload_obj);
                        user_data.dataValues.token = token;
                        routes_helper.helperService.getCartCount(user_data.user_id, (err, cart_count) => {
                            if (err) {
                                console.log(err);
                                let statusCode = new constants.response().SERVER_ERROR;
                                return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                            } else {
                                // ------- delete specific key from obj ------
                                delete user_data.dataValues['user_password'];
                                user_data.dataValues.cart_count = cart_count;
                                return res.json(constants.response.sendSuccess('USER_LOGIN_SUCCESS', user_data, req.params.lang));
                            }
                        })

                    } else {
                        let statusCode = new constants.response().UNAUTHORIZED;
                        return res.json(constants.response.sendFailure('INVAILD_USER_PASSWORD', req.params.lang, statusCode));
                    }
                }).catch(function (err) {
                    console.log(err)
                    let statusCode = new constants.response().NOT_FOUND;
                    return res.json(constants.response.sendFailure('USER_LOGIN_FAILURE', req.params.lang, statusCode));
                });
        }
    });





    //=======================================================================================================//
    //*
    //*                                   Edit user(Put)
    //*                          Desc = This Api Edit user by user id  
    //========================================================================================================//

    api.put('/:lang/update_user', authmiddleware.auth_route, Upload, (req, res) => {
        try {
            // ---------------define Variable -----------------------------
            var user_id = req.query.user_id;

            // ---------------End of define Variable-----------------------
            //-----------check mandatory params--------------
            if ((!user_id)) {
                let statusCode = new constants.response().PARAMETER_MISSING;
                return res.json(constants.response.sendFailure('MANDATORY_PARAMETER_MISSING', req.params.lang, statusCode));
            } else {
                // -------------find product for specific id
                userService.UserSchema.findOne({
                    where: {
                        user_id: user_id
                    },
                    //attributes: ['product_description', 'product_name'], //object
                }).then(object_data => {
                    //----------- Define variable if undefined set old value else new value
                    var user_first_name = req.body.user_first_name ? req.body.user_first_name : object_data.user_first_name;
                    var user_last_name = req.body.user_last_name ? req.body.user_last_name : object_data.user_last_name;
                    var user_lat = req.body.user_lat ? req.body.user_lat : object_data.user_lat;
                    var user_long = req.body.user_long ? req.body.user_long : object_data.user_long;
                    var user_timezone = req.body.user_timezone ? req.body.user_timezone : object_data.user_timezone;
                    var user_address = req.body.user_address ? req.body.user_address : object_data.user_address;
                    var user_city = req.body.user_city ? req.body.user_city : object_data.user_city;

                    var user_state = req.body.user_state ? req.body.user_state : object_data.user_state;
                    var user_country = req.body.user_country ? req.body.user_country : object_data.user_country;
                    var user_zipcode = req.body.user_zipcode ? req.body.user_zipcode : object_data.user_zipcode;
                    var user_phone_no = req.body.user_phone_no ? req.body.user_phone_no : object_data.user_phone_no;

                    var user_social_sign_type = req.body.user_social_sign_type ? req.body.user_social_sign_type : object_data.user_social_sign_type;
                    var user_social_sign_id = req.body.user_social_sign_id ? req.body.user_social_sign_id : object_data.user_social_sign_id;
                    var user_device_type = req.body.user_device_type ? req.body.user_device_type : object_data.user_device_type;
                    var user_device_token = req.body.user_device_token ? req.body.user_device_token : object_data.user_device_token;
                    var user_status = req.body.user_status ? req.body.user_status : object_data.user_status;
                    //--------------Update single row ----------------
                    if (!req.files.user_profile_pic) {
                        var image = object_data.user_profile_pic;
                    } else {
                        // ----- Delete image from s3
                        var pics = object_data.user_profile_pic;
                        if (pics != '') {
                            constants.s3.deleteObject({
                                Bucket: constants.S3CONSTANT.Bucket,
                                Key: pics
                            }, function (err, data) {})
                        }
                        var image = req.files.user_profile_pic[0].key;
                    }
                    userService.UserSchema.update({ // update query

                            user_first_name: user_first_name,
                            user_last_name: user_last_name,
                            user_lat: user_lat,
                            user_long: user_long,
                            user_timezone: user_timezone,
                            user_address: user_address,
                            user_city: user_city,
                            user_state: user_state,
                            user_country: user_country,
                            user_zipcode: user_zipcode,
                            user_phone_no: user_phone_no,
                            user_social_sign_type: user_social_sign_type,
                            user_social_sign_id: user_social_sign_id,
                            user_device_type: user_device_type,
                            user_device_token: user_device_token,
                            user_status: user_status,
                            user_profile_pic: image,
                        }, {
                            where: {
                                user_id: user_id
                            }
                        })
                        // if updated succesfully 
                        .then(function (update_object) {
                            userService.UserSchema.findOne({ // object
                                attributes: {
                                    exclude: ["user_password"]
                                },
                                where: {
                                    user_id: user_id
                                },
                                //attributes: ['product_description', 'product_name'], //object
                            }).then(updated_object => { // select object
                                routes_helper.helperService.getCartCount(object_data.user_id, (err, cart_count) => {
                                    if (err) {
                                        console.log(err);
                                        let statusCode = new constants.response().SERVER_ERROR;
                                        return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                                    } else {
                                        updated_object.cart_count = cart_count
                                        return res.json(constants.response.sendSuccess('DEFAULT_SUCCESS_MESSAGE', updated_object, req.params.lang));
                                    }
                                })

                                //-------------- NOt found or bad req
                            }).catch(err => {
                                console.log((err))
                                let statusCode = new constants.response().BAD_REQUEST;
                                return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode))
                            })
                            //--------------- Unable to update 
                        }).catch(function (err) {
                            console.log(err)
                            let statusCode = new constants.response().BAD_REQUEST;
                            return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                        });;
                    //--------------------if invalid id or bad req
                }).catch(error => {
                    console.log(error)
                    let statusCode = new constants.response().SERVER_ERROR;
                    return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                })
            }
        } catch (e) {
            console.log(e)
            let statusCode = new constants.response().SERVER_ERROR;
            return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
        }
    });
    //---------------------------------------------------------------------------------------------------------




    //=======================================================================================================//
    //*
    //*                                Change password user(Put)
    //*                 Desc = This Api change user Password by user id  
    //========================================================================================================//
    // authmiddleware.auth_route,
    api.put('/:lang/changePassword_user', authmiddleware.auth_route, Upload, (req, res) => {
        try {
            // --------------- define Variable -----------------------------
            var user_id = req.query.user_id;
            var user_password = req.body.user_password ? req.body.user_password : '';
            var confirm_user_password = req.body.confirm_user_password ? req.body.confirm_user_password : '';
            var old_password = req.body.old_password ? req.body.old_password : '';
            // ---------------End of define Variable-----------------------
            //-----------check mandatory params--------------
            if ((!user_id) || user_password.trim() == '' || confirm_user_password.trim() == '' || old_password.trim() == '') {
                let statusCode = new constants.response().PARAMETER_MISSING;
                return res.json(constants.response.sendFailure('MANDATORY_PARAMETER_MISSING', req.params.lang, statusCode));
            } else {
                // ------ find user ---------------
                var finduser = userService.UserSchema
                    .findOne({
                        //attributes: { exclude: ["user_password"] },
                        where: {
                            user_id: user_id,
                        },
                        //required: false
                    }).then(user_data => {
                        console.log(req.body.user_password)
                        let correctPwd = bcrypt.compareSync(old_password, user_data.user_password);
                        // ---- if old password match --------
                        if (correctPwd) {
                            //---- if new and old password are same
                            if (user_password == confirm_user_password) {
                                let checkPwd = bcrypt.compareSync(user_password, user_data.user_password);
                                // ---- if old password match --------
                                if (checkPwd == false) {
                                    // -----Update Password ------------
                                    userService.UserSchema.update({ // update query
                                            user_password: bcrypt.hashSync(user_password)
                                        }, {
                                            where: {
                                                user_id: user_id
                                            }
                                        })
                                        // ---- if updated succesfully 
                                        .then(function (update_object) {
                                            return res.json(constants.response.sendSuccess('DEFAULT_SUCCESS_MESSAGE', update_object, req.params.lang));
                                            //---- Unable to update 
                                        }).catch(function (err) {
                                            console.log(err)
                                            let statusCode = new constants.response().SERVER_ERROR;
                                            return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                                        });
                                } else {
                                    let statusCode = new constants.response().PRECONDITION_FAILED;
                                    return res.json(constants.response.sendFailure('OLD_NEW_PASSWORD_SAME', req.params.lang, statusCode));

                                }
                                //---- if passwords does not match    
                            } else {
                                let statusCode = new constants.response().PRECONDITION_FAILED;
                                return res.json(constants.response.sendFailure('PASSWORD_NOT_MATCH', req.params.lang, statusCode));
                            }

                        } else {
                            let statusCode = new constants.response().PRECONDITION_FAILED;
                            return res.json(constants.response.sendFailure('INVALID_OLD_PASSWORD', req.params.lang, statusCode));
                        }
                    }).catch(e => {
                        console.log(e)
                        let statusCode = new constants.response().SERVER_ERROR;
                        return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                    })

            }
            //---- if invalid id or bad req 
        } catch (e) {
            console.log(e)
            let statusCode = new constants.response().SERVER_ERROR;
            return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
        }
    });
    //---------------------------------------------------------------------------------------------------------



    //=======================================================================================================//
    //*
    //*                                Get user(Get)
    //*                 Desc = This Api Get single user Profile by user id  
    //========================================================================================================//

    api.get('/:lang/get_user_profile', authmiddleware.auth_route, Upload, (req, res) => {
        try {
            // --------------- define Variable -----------------------------
            var user_id = req.query.user_id;
            var send_user_id = req.query.send_user_id ? req.query.send_user_id : '';

            // ---------------End of define Variable-----------------------
            //-----------check mandatory params--------------
            if ((!user_id) || send_user_id.trim() == '') {
                let statusCode = new constants.response().PARAMETER_MISSING;
                return res.json(constants.response.sendFailure('MANDATORY_PARAMETER_MISSING', req.params.lang, statusCode));
            } else {
                // ------ find user ---------------
                var finduser = userService.UserSchema
                    .findOne({
                        attributes: {
                            exclude: ["user_password"]
                        },
                        where: {
                            user_id: send_user_id,
                        },
                        //required: false
                    }).then(user_data => {
                        routes_helper.helperService.getCartCount(user_data.user_id, (err, cart_count) => {
                            if (err) {
                                console.log(err);
                                let statusCode = new constants.response().SERVER_ERROR;
                                return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                            } else {
                                user_data.cart_count = cart_count;
                                return res.json(constants.response.sendSuccess('DEFAULT_SUCCESS_MESSAGE', user_data, req.params.lang));
                            }
                        })
                        return res.json(constants.response.sendSuccess('DEFAULT_SUCCESS_MESSAGE', user_data, req.params.lang));

                    }).catch(e => {
                        console.log(e)
                        let statusCode = new constants.response().SERVER_ERROR;
                        return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
                    })

            }
            //---- if invalid id or bad req 
        } catch (e) {
            console.log(e)
            let statusCode = new constants.response().SERVER_ERROR;
            return res.json(constants.response.sendFailure('DEFAULT_FAILURE_MESSAGE', req.params.lang, statusCode));
        }
    });
    //---------------------------------------------------------------------------------------------------------

    return api;
};