import { expect, describe, beforeEach, it, jest } from '@jest/globals';
import { addDevice } from '../../../src/controllers/deviceController.js';
import { Device } from '../../../src/models/index.js';
import { ApiResponse } from '../../../src/utils/response.js';

// Mock dependencies
jest.mock('../../../models/index.js');
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-api-token'),
  }),
}));

describe('Device Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockReq = {
      context: {
        params: {
          platform: 'ios',
          deviceName: 'iPhone 14',
          token: 'device-token-123',
        },
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the Device model's create method
    Device.create = jest.fn().mockResolvedValue({
      id: 1,
      platform: 'ios',
      deviceName: 'iPhone 14',
      token: 'device-token-123',
      apiToken: 'mocked-api-token',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should create a new device successfully', async () => {
    // Act
    await addDevice(mockReq, mockRes);

    // Assert
    expect(Device.create).toHaveBeenCalledWith({
      platform: 'ios',
      deviceName: 'iPhone 14',
      token: 'device-token-123',
      apiToken: 'mocked-api-token',
    });

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(ApiResponse));

    // Check the content of the response
    const responseArg = mockRes.json.mock.calls[0][0];
    expect(responseArg.data).toEqual({ token: 'mocked-api-token' });
  });

  it('should handle errors during device creation', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    Device.create.mockRejectedValue(error);

    // Act & Assert
    await expect(addDevice(mockReq, mockRes)).rejects.toThrow('Database connection failed');
  });
});
