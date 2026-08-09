const express = require("express");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

// ========================================
// TARGET APPLICATION STATE
// ========================================

let targetState = {
    healthy: true,
    requests: 0,
    errors: 3,
    responseTime: 124
};

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {

    targetState.requests++;

    res.json({
        application: "MIRROR Target Application",
        status: targetState.healthy
            ? "healthy"
            : "degraded"
    });
});

// ========================================
// TEST API
// ========================================

app.get("/api/test", async (req, res) => {

    targetState.requests++;

    if (!targetState.healthy) {

        await new Promise(resolve =>
            setTimeout(resolve, 380)
        );

        targetState.errors++;

        return res.status(500).json({
            success: false,
            error: "Application performance degraded"
        });
    }

    await new Promise(resolve =>
        setTimeout(resolve, 124)
    );

    res.json({
        success: true,
        message: "Target application is healthy"
    });
});

// ========================================
// HEALTH ENDPOINT
// ========================================

app.get("/health", (req, res) => {

    res.json({

        status:
            targetState.healthy
                ? "healthy"
                : "degraded",

        requests:
            targetState.requests,

        errors:
            targetState.errors,

        responseTime:
            targetState.responseTime
    });
});

// ========================================
// SIMULATE FAILURE
// ========================================

app.post("/simulate-failure", (req, res) => {

    targetState.healthy = false;

    targetState.responseTime = 380;

    // Simulated evidence for MIRROR
    targetState.errors = 47;

    res.json({

        success: true,

        message:
            "Target application degradation simulated",

        state:
            targetState
    });
});

// ========================================
// RECOVER APPLICATION
// ========================================

app.post("/recover", (req, res) => {

    targetState.healthy = true;

    targetState.responseTime = 124;

    targetState.errors = 3;

    res.json({

        success: true,

        message:
            "Target application recovered",

        state:
            targetState
    });
});

// ========================================
// START TARGET
// ========================================

app.listen(PORT, () => {

    console.log(
        `Target application running at http://localhost:${PORT}`
    );

});