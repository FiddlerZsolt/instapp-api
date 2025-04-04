'use strict';

const apiRouter = require('express').Router();
const fs = require('fs');
const path = require('path');
const { authorization } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

module.exports = loadServices;
