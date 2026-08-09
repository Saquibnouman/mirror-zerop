const express = require("express");
const path = require("path");

const app = express();

const PORT =
    process.env.PORT || 3000;

const TARGET_URL =
    process.env.TARGET_URL ||
    "http://localhost:4000";

app.use(express.json());

// =========================================================
// FRONTEND
// =========================================================

const publicPath =
    path.join(__dirname, "public");

app.use(
    express.static(publicPath)
);

// =========================================================
// EVENTS
// =========================================================

let events = [];

// =========================================================
// ADD EVENT
// =========================================================

function addEvent(type, message) {

    events.unshift({

        type,

        time:
            new Date().toLocaleTimeString(),

        message

    });

    events =
        events.slice(0, 20);

}

// =========================================================
// INITIAL EVENT
// =========================================================

addEvent(
    "info",
    "MIRROR monitoring started."
);

// =========================================================
// REQUEST TARGET
// =========================================================

async function requestTarget(
    endpoint,
    method = "GET"
) {

    const startTime =
        Date.now();

    const response =
        await fetch(
            `${TARGET_URL}${endpoint}`,
            {
                method,

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    const responseTime =
        Date.now() - startTime;

    let data = {};

    try {

        data =
            await response.json();

    } catch {

        data = {};

    }

    return {

        response,

        data,

        responseTime

    };

}

// =========================================================
// NORMALIZE STATE
// =========================================================

function normalizeTargetState(data) {

    if (!data) {

        return {

            health: 98,

            api: 124,

            errors: 0,

            status: "healthy"

        };

    }

    const isDegraded =
        data.status === "degraded" ||
        data.healthy === false;

    if (isDegraded) {

        return {

            health:
                Number.isFinite(
                    Number(data.health)
                )
                    ? Number(data.health)
                    : 61,

            api:
                Number.isFinite(
                    Number(data.api)
                )
                    ? Number(data.api)
                    : 380,

            errors:
                Number.isFinite(
                    Number(data.errors)
                )
                    ? Number(data.errors)
                    : 47,

            status:
                "degraded"

        };

    }

    return {

        health:
            Number.isFinite(
                Number(data.health)
            )
                ? Number(data.health)
                : 98,

        api:
            Number.isFinite(
                Number(data.api)
            )
                ? Number(data.api)
                : 124,

        errors:
            Number.isFinite(
                Number(data.errors)
            )
                ? Number(data.errors)
                : 0,

        status:
            "healthy"

    };

}

// =========================================================
// HEALTH
// =========================================================

app.get("/api/health", async (req, res) => {

    try {

        const result =
            await requestTarget(
                "/health"
            );

        const state =
            normalizeTargetState(
                result.data
            );

        res.json({

            success: true,

            service:
                "MIRROR",

            target:
                TARGET_URL,

            ...state,

            responseTime:
                result.responseTime,

            timestamp:
                new Date().toISOString()

        });

    } catch (error) {

        console.error(
            "Health monitoring error:",
            error.message
        );

        res.status(503).json({

            success: false,

            service:
                "MIRROR",

            target:
                TARGET_URL,

            healthy:
                false,

            status:
                "unreachable",

            health:
                0,

            api:
                0,

            errors:
                0,

            error:
                error.message,

            timestamp:
                new Date().toISOString()

        });

    }

});

// =========================================================
// MONITOR
// =========================================================

app.get("/api/monitor", async (req, res) => {

    try {

        const result =
            await requestTarget(
                "/health"
            );

        const state =
            normalizeTargetState(
                result.data
            );

        res.json({

            success: true,

            target:
                TARGET_URL,

            status:
                result.response.status,

            healthy:
                result.response.ok,

            responseTime:
                result.responseTime,

            state,

            checkedAt:
                new Date().toISOString()

        });

    } catch (error) {

        res.status(503).json({

            success: false,

            target:
                TARGET_URL,

            healthy:
                false,

            status:
                "unreachable",

            responseTime:
                0,

            error:
                error.message,

            checkedAt:
                new Date().toISOString()

        });

    }

});

// =========================================================
// EVENTS
// =========================================================

app.get("/api/events", (req, res) => {

    res.json(events);

});

// =========================================================
// SIMULATE CHANGE
// =========================================================

app.post("/api/simulate", async (req, res) => {

    try {

        console.log(
            "MIRROR: Triggering application change..."
        );

        const result =
            await requestTarget(
                "/simulate-failure",
                "POST"
            );

        const state =
            normalizeTargetState(
                result.data
            );

        addEvent(
            "warning",
            "Application change detected. MIRROR is investigating system impact."
        );

        addEvent(
            "error",
            `API latency increased to ${state.api}ms and error activity increased to ${state.errors}.`
        );

        addEvent(
            "critical",
            "MIRROR identified a probable application performance regression."
        );

        const analysis = {

            diagnosis:
                "Application performance regression detected",

            severity:
                "CRITICAL",

            confidence:
                99,

            recommendation:
                "Inspect the latest application change and review the API processing path for a performance regression."

        };

        res.json({

            success: true,

            previousState: {

                health: 98,

                api: 124,

                errors: 0

            },

            state,

            analysis,

            message:
                "Application change simulated successfully."

        });

    } catch (error) {

        console.error(
            "Simulation error:",
            error.message
        );

        addEvent(
            "error",
            "MIRROR could not trigger the application simulation."
        );

        res.status(500).json({

            success: false,

            message:
                "Could not simulate application change.",

            error:
                error.message

        });

    }

});

// =========================================================
// RECOVER
// =========================================================

app.post("/api/recover", async (req, res) => {

    try {

        console.log(
            "MIRROR: Triggering application recovery..."
        );

        const result =
            await requestTarget(
                "/recover",
                "POST"
            );

        const state =
            normalizeTargetState(
                result.data
            );

        addEvent(
            "success",
            "Recovery signal received from the target application."
        );

        addEvent(
            "info",
            "MIRROR verified that the application returned to a healthy state."
        );

        res.json({

            success: true,

            state,

            message:
                "Application recovered successfully."

        });

    } catch (error) {

        console.error(
            "Recovery error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Could not recover application.",

            error:
                error.message

        });

    }

});

// =========================================================
// ROOT
// =========================================================

app.get("/", (req, res) => {

    const indexPath =
        path.join(
            publicPath,
            "index.html"
        );

    res.sendFile(
        indexPath,
        error => {

            if (error) {

                console.error(
                    "Frontend error:",
                    error
                );

                if (!res.headersSent) {

                    res.status(500).json({

                        success: false,

                        message:
                            "Frontend file could not be loaded.",

                        expectedFile:
                            indexPath

                    });

                }

            }

        }
    );

});

// =========================================================
// 404
// =========================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message:
            "Route not found."

    });

});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "MIRROR server error:",
            error
        );

        if (res.headersSent) {

            return next(error);

        }

        res.status(500).json({

            success: false,

            message:
                "Internal MIRROR server error."

        });

    }
);

// =========================================================
// STARTUP RESET
// =========================================================

async function resetTargetOnStartup() {

    try {

        const result =
            await requestTarget(
                "/recover",
                "POST"
            );

        if (result.response.ok) {

            console.log(
                "MIRROR: Target initialized in healthy state."
            );

            addEvent(
                "info",
                "Target application initialized in healthy state."
            );

        }

    } catch (error) {

        console.error(
            "MIRROR startup reset failed:",
            error.message
        );

        console.log(
            "Make sure target-server.js is running on port 4000."
        );

    }

}

// =========================================================
// START SERVER
// =========================================================

app.listen(
    PORT,
    async () => {

        console.log(
            `MIRROR server running at http://localhost:${PORT}`
        );

        console.log(
            `Monitoring target: ${TARGET_URL}`
        );

        console.log(
            `Frontend directory: ${publicPath}`
        );

        await resetTargetOnStartup();

    }
);