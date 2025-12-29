import { seedDataV2 } from './seedData_v2';

(async () => {
    try {
        await seedDataV2();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
