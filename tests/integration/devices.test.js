import { expect, describe, beforeEach, it } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js'; // Adjust the path to your app file
import { Device } from '../../src/models/index.js';
import { Op } from 'sequelize';

const mockData = [
  {
    platform: 'ios',
    deviceName: 'iPhone 13',
    token: 'device-token-1',
  },
  {
    platform: 'invalid',
    deviceName: 'iPhone 13',
    token: 'device-token-2',
  },
];

describe('Device API Integration Tests', () => {
  beforeEach(async () => {
    await Device.destroy({
      where: {
        [Op.or]: [{ deviceName: mockData[0].deviceName }, { deviceName: mockData[1].deviceName }],
      },
      force: true,
    });
  });

  it('should create a device successfully', async () => {
    const response = await request(app).post('/api/devices').send(mockData[0]).expect(201);

    expect(response.body).toHaveProperty('token');
  });

  it('should return validation error for invalid platform', async () => {
    const response = await request(app).post('/api/devices').send(mockData[1]).expect(422);

    expect(response.body).toHaveProperty('statusCode', 422);
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(response.body).toHaveProperty('name', 'ValidationError');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data[0]).toHaveProperty('type', 'enumValue');
    expect(response.body.data[0]).toHaveProperty(
      'message',
      "The 'platform' field value 'android, ios' does not match any of the allowed values."
    );
    expect(response.body.data[0]).toHaveProperty('field', 'platform');
    expect(response.body.data[0]).toHaveProperty('expected', 'android, ios');
    expect(response.body.data[0]).toHaveProperty('actual', 'invalid');
  });

  it('should return validation error for missing required fields', async () => {
    const response = await request(app).post('/api/devices').send({}).expect(422);

    expect(response.body).toHaveProperty('statusCode', 422);
    expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(response.body).toHaveProperty('name', 'ValidationError');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data[0]).toHaveProperty('type', 'required');
    expect(response.body.data[0]).toHaveProperty('message', "The 'platform' field is required.");
    expect(response.body.data[0]).toHaveProperty('field', 'platform');
  });
});
