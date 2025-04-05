import { expect, describe, beforeAll, afterAll, it } from '@jest/globals';
import { Sequelize } from 'sequelize';
import DeviceModel from '../../../src/models/device.js';

describe('Device Model', () => {
  let sequelize;
  let Device;

  beforeAll(() => {
    // Set up an in-memory database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
    });

    // Initialize the Device model with our test sequelize instance
    Device = DeviceModel(sequelize, Sequelize.DataTypes);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a device with valid attributes', async () => {
    // Arrange
    const deviceData = {
      platform: 'ios',
      deviceName: 'iPhone 14',
      token: 'device-token-123',
      apiToken: 'api-token-xyz',
      isActive: true,
    };

    // Act
    const device = Device.build(deviceData);

    // Assert
    expect(device.platform).toBe('ios');
    expect(device.deviceName).toBe('iPhone 14');
    expect(device.token).toBe('device-token-123');
    expect(device.apiToken).toBe('api-token-xyz');
    expect(device.isActive).toBe(true);
    expect(device.userId).toBeNull();
  });

  it('should validate required fields', async () => {
    // Arrange
    const invalidDevice = Device.build({});

    // Act & Assert
    try {
      await invalidDevice.validate();
      // If validation doesn't throw, the test should fail
      expect(false).toBe(true, 'Validation should have failed');
    } catch (error) {
      expect(error.errors).toHaveLength(4); // platform, deviceName, token, apiToken

      const errorFields = error.errors.map((err) => err.path);
      expect(errorFields).toContain('platform');
      expect(errorFields).toContain('deviceName');
      expect(errorFields).toContain('token');
      expect(errorFields).toContain('apiToken');
    }
  });

  it('should validate platform enum values', async () => {
    // Arrange
    const invalidDevice = Device.build({
      platform: 'windows', // Invalid platform
      deviceName: 'Surface Pro',
      token: 'device-token-456',
      apiToken: 'api-token-abc',
    });

    // Act & Assert
    try {
      await invalidDevice.validate();
      expect(false).toBe(true, 'Validation should have failed');
    } catch (error) {
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].path).toBe('platform');
    }
  });
});
