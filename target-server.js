const express = require("express");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

// =========================================================
// TARGET APPLICATION STATES
// =========================================================

const HEALTHY_STATE = {
    mode: "healthy",
    health: 98,
    api: 124,
    errors: 0
};

const DEGRADED_STATE = {
    mode: "degraded",
    health: 61,
    api: 380,
    errors: 47
};

let applicationState = {
    ...HEALTHY_STATE
};

// =========================================================
// HEALTH
// =========================================================

app.get("/health", (req, res) => {

    const isDegraded =
        applicationState.mode === "degraded";

    res.json({

        success: true,

        service:
            "TARGET APPLICATION",

        status:
            isDegraded
                ? "degraded"
                : "healthy",

        healthy:
            !isDegraded,

        health:
            applicationState.health,

        api:
            applicationState.api,

        errors:
            applicationState.errors,

        message:
            isDegraded
                ? "Application is experiencing degraded performance."
                : "Application is operating normally."

    });

});

// =========================================================
// API TEST
// =========================================================

app.get("/api/test", (req, res) => {

    res.json({

        success: true,

        message:
            "API is working correctly.",

        timestamp:
            new Date().toISOString()

    });

});

// =========================================================
// SIMULATE FAILURE
// =========================================================

app.post("/simulate-failure", (req, res) => {

    applicationState = {
        ...DEGRADED_STATE
    };

    console.log(
        "TARGET: Application change simulated."
    );

    res.json({

        success: true,

        status:
            "degraded",

        healthy:
            false,

        health:
            61,

        api:
            380,

        errors:
            47,

        message:
            "Application change simulated successfully."

    });

});

// =========================================================
// RECOVER
// =========================================================

app.post("/recover", (req, res) => {

    applicationState = {
        ...HEALTHY_STATE
    };

    console.log(
        "TARGET: Application recovered."
    );

    res.json({

        success: true,

        status:
            "healthy",

        healthy:
            true,

        health:
            98,

        api:
            124,

        errors:
            0,

        message:
            "Application recovered successfully."

    });

});

// =========================================================
// ROOT
// =========================================================

app.get("/", (req, res) => {

    res.json({

        application:
            "MIRROR Target Application",

        status:
            applicationState.mode,

        health:
            applicationState.health,

        api:
            applicationState.api,

        errors:
            applicationState.errors

    });

});

// =========================================================
// 404
// =========================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message:
            "Target route not found."

    });

});

// =========================================================
// START
// =========================================================

app.listen(PORT, () => {

    console.log(
        `Target application running at http://localhost:${PORT}`
    );

    console.log(
        "Target starts in HEALTHY state."
    );

    console.log(
        "Healthy: 98 health | 124ms API | 0 errors"
    );

});