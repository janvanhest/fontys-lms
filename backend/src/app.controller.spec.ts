import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController(new AppService());
  });

  describe('root', () => {
    it('should return API info', () => {
      expect(appController.getInfo()).toEqual({
        name: 'fontys-lms-backend',
        version: '0.0.1',
      });
    });
  });
});
