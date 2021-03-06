import { ActionLast } from '..';

describe('ActionLast', () => {
  let mockAction;

  beforeEach(() => {
    let counter = 0;
    const testPromise = a =>
      new Promise(resolve => {
        setTimeout(() => {
          counter += 1;
          resolve(a + counter);
        }, 1);
      });
    mockAction = new ActionLast(async ({ a }) => {
      const ret = await testPromise(a);
      return ret;
    });
  });

  it('simple call', async () => {
    const result = await mockAction.execute({ a: 0 });
    expect(result).toEqual(1);
  });

  it('multiple calls - should resolve same last value when equal payload', async () => {
    const promise1 = mockAction.execute({ a: 0 });
    const promise2 = mockAction.execute({ a: 0 });
    const promise3 = mockAction.execute({ a: 0 });

    let testvalue1, testvalue2, testvalue3;
    promise1.then(result => (testvalue1 = result));
    promise2.then(result => (testvalue2 = result));
    promise3.then(result => (testvalue3 = result));
    await Promise.all([promise1, promise2, promise3]);
    expect(testvalue1).toEqual(3);
    expect(testvalue2).toEqual(3);
    expect(testvalue3).toEqual(3);
  });

  it('multiple calls - should resolve same last value when different paylaods', async () => {
    const promise1 = mockAction.execute({ a: 0 });
    const promise2 = mockAction.execute({ a: 1 });
    const promise3 = mockAction.execute({ a: 2 });

    let testvalue1, testvalue2, testvalue3;
    promise1.then(result => (testvalue1 = result));
    promise2.then(result => (testvalue2 = result));
    promise3.then(result => (testvalue3 = result));
    await Promise.all([promise1, promise2, promise3]);
    expect(testvalue1).toEqual(5);
    expect(testvalue2).toEqual(5);
    expect(testvalue3).toEqual(5);
  });

  it('should create new Promise after the previous resolved', async () => {
    const promise1 = mockAction.execute({ a: 5 });
    await promise1;
    const promise2 = mockAction.execute({ a: 5 });
    expect(promise1 !== promise2).toBeTruthy();
  });

  it('should reject on throw', () => {
    const mockError = new Error('eeee');
    mockAction = new ActionLast(async () => {
      throw mockError;
    });
    const promise1 = mockAction.execute({ a: 6 });
    const promise2 = mockAction.execute({ a: 5 });
    expect(promise1).rejects.toBe(mockError);
    expect(promise2).rejects.toBe(mockError);
  });
});
