
import BatchQuery from '../src';

describe('Regression: BatchQuery Promise Hang', () => {
    it('should not hang when callback is called with null rows', async () => {
        const q = new BatchQuery({ text: 'SELECT 1', values: [] });
        const promise = q.execute(); // Sets q.callback

        // Manually invoke the callback with null error and null rows
        // This simulates the scenario where the promise might hang
        if (q.callback) {
            q.callback(null, null);
        } else {
            throw new Error('Callback was not set');
        }

        // Expect the promise to resolve to empty array
        // We use a timeout to detect the hang (though with the fix it should be instant)
        const result = await Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout - Promise Hung')), 1000))
        ]);

        expect(result).toEqual([]);
    });
});
