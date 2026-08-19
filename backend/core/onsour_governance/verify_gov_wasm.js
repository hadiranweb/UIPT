const { ThermodynamicGovernor, SystemMetrics } = require('./pkg/onsour_governance.js');

function run_test() {
    console.log("Starting WASM Governance Determinism Verification...");
    
    const base = 0.1;
    const min = 0.005;
    const max = 0.25;
    const alpha = 0.3;
    
    const gov = new ThermodynamicGovernor(base, min, max, alpha);
    
    const scenarios = [
        [0.1, 0.1, 5.0],
        [0.5, 0.5, 50.0],
        [0.9, 0.9, 200.0],
        [0.0, 1.0, 10.0]
    ];

    const results = [];
    for (const [cpu, mem, lat] of scenarios) {
        const metrics = new SystemMetrics(cpu, mem, lat);
        let eps = 0;
        for (let i = 0; i < 10; i++) {
            eps = gov.compute_dynamic_epsilon_wasm(metrics, BigInt(10000));
        }
        results.push(eps);
    }

    const expected = [6238, 4804, 3036, 5059];
    console.log("WASM Computed Epsilons:", results);
    
    let match = true;
    for (let i = 0; i < expected.length; i++) {
        if (results[i] !== expected[i]) {
            match = false;
            break;
        }
    }

    if (match) {
        console.log("SUCCESS: WASM Governance results are BIT-EXACT with Native!");
    } else {
        console.error("FAILURE: WASM Governance diverged!");
        process.exit(1);
    }

    // PoT Hash Test
    const state_root = "d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2";
    const metrics_nominal = new SystemMetrics(0.5, 0.5, 50.0);
    const eps_nominal = gov.compute_dynamic_epsilon_wasm(metrics_nominal, BigInt(10000));
    const snapshot = gov.create_snapshot_wasm(BigInt(1), eps_nominal, state_root);
    
    const hash = gov.last_hash; // wasm-bindgen getter is a property
    const expected_hash = "ebfb1b6c2dba5805852c907892fc6f189b464535675c6a4731beb5adfb49be25";
    
    if (hash === expected_hash) {
        console.log("SUCCESS: PoT Hash is BIT-EXACT with Native!");
    } else {
        console.error("FAILURE: PoT Hash diverged! Got:", hash);
        process.exit(1);
    }
}

run_test();
