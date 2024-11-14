// Importing functions and models from userModule.js
const { User, registerUser, loginUser, verifyToken } = require('./userModule');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Dummy request and response objects for testing
const mockReqRes = () => {
  const req = {
    body: {},
    headers: {}
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn((data) => console.log('Response:', data)),
  };
  return { req, res };
};

// Test registerUser function
const testRegisterUser = async () => {
  const { req, res } = mockReqRes();

  req.body = {
    username: "testUser",
    email: "testuser@example.com",
    password: "password123"
  };

  console.log('Testing registerUser...');
  await registerUser(req, res);
};

// Test loginUser function
const testLoginUser = async () => {
  const { req, res } = mockReqRes();

  req.body = {
    email: "testuser@example.com",
    password: "password123"
  };

  console.log('Testing loginUser...');
  await loginUser(req, res);
};

// Test verifyToken function
const testVerifyToken = () => {
  const { req, res } = mockReqRes();

  // Generate a valid token
  const token = jwt.sign({ userId: "someUserId" }, process.env.JWT_SECRET, { expiresIn: '1h' });
  req.headers['authorization'] = token;

  console.log('Testing verifyToken...');
  verifyToken(req, res, () => {
    console.log('verifyToken: Token verified successfully!');
  });
};

// Run the tests
const runTests = async () => {
  await testRegisterUser();
  await testLoginUser();
  testVerifyToken();
};

runTests();
