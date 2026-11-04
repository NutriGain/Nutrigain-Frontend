import { fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('shows a toast and removes it after its duration', fakeAsync(() => {
    const service = new ToastService();
    service.success('Guardado');
    expect(service.items().length).toBe(1);
    expect(service.items()[0].type).toBe('success');
    tick(3500);
    expect(service.items().length).toBe(0);
  }));

  it('keeps errors visible longer than successes', fakeAsync(() => {
    const service = new ToastService();
    service.error('Falló');
    tick(3600);
    expect(service.items().length).toBe(1);
    tick(1500);
    expect(service.items().length).toBe(0);
  }));

  it('never keeps more than four toasts on screen', () => {
    const service = new ToastService();
    for (let i = 0; i < 8; i++) {
      service.info('msg ' + i);
    }
    expect(service.items().length).toBeLessThanOrEqual(4);
  });

  it('can dismiss a toast manually', () => {
    const service = new ToastService();
    service.info('Hola');
    service.dismiss(service.items()[0].id);
    expect(service.items().length).toBe(0);
  });
});
