// =========================================================
// MIRROR — FRONTEND CONTROLLER
// =========================================================

// =========================================================
// DOM
// =========================================================

const simulateButton =
    document.getElementById(
        "simulateButton"
    );

const analysisContent =
    document.getElementById(
        "analysisContent"
    );

const eventsList =
    document.getElementById(
        "eventsList"
    );

// =========================================================
// HEALTH
// =========================================================

const healthScore =
    document.querySelector(
        ".health-score"
    );

const healthyMessage =
    document.querySelector(
        ".healthy-message"
    );

const healthBarFill =
    document.getElementById(
        "healthBarFill"
    );

// =========================================================
// METRICS
// =========================================================

const metricValues =
    document.querySelectorAll(
        ".metric-card strong"
    );

const apiValue =
    metricValues[0];

const errorValue =
    metricValues[2];

const apiStatus =
    document.getElementById(
        "apiStatus"
    );

const errorStatus =
    document.getElementById(
        "errorStatus"
    );

// =========================================================
// IMPACT MAP
// =========================================================

const impactApi =
    document.getElementById(
        "impactApi"
    );

const impactErrors =
    document.getElementById(
        "impactErrors"
    );

const impactHealth =
    document.getElementById(
        "impactHealth"
    );

const impactCause =
    document.getElementById(
        "impactCause"
    );

const impactSeverity =
    document.getElementById(
        "impactSeverity"
    );

const impactConfidence =
    document.getElementById(
        "impactConfidence"
    );

const impactStatusText =
    document.getElementById(
        "impactStatusText"
    );

// =========================================================
// TARGET
// =========================================================

const targetBadge =
    document.getElementById(
        "targetBadge"
    );

const targetStatus =
    document.getElementById(
        "targetStatus"
    );

// =========================================================
// STATES
// =========================================================

const BASELINE = {

    health: 98,

    api: 124,

    errors: 0,

    status: "healthy"

};

const FAILURE = {

    health: 61,

    api: 380,

    errors: 47,

    status: "degraded"

};

let systemMode =
    "healthy";

let livePolling =
    null;

// =========================================================
// ANALYSIS
// =========================================================

const FAILURE_ANALYSIS = {

    diagnosis:
        "Application performance regression detected",

    severity:
        "CRITICAL",

    confidence:
        99,

    recommendation:
        "Inspect the latest application change and review the API processing path for a performance regression."

};

// =========================================================
// BUTTON
// =========================================================

function setButton(
    text,
    background,
    color,
    disabled = false
) {

    if (!simulateButton) {
        return;
    }

    simulateButton.textContent =
        text;

    simulateButton.style.background =
        background;

    simulateButton.style.color =
        color;

    simulateButton.disabled =
        disabled;

}

// =========================================================
// NORMALIZE
// =========================================================

function normalizeState(data) {

    if (!data) {

        return {
            ...BASELINE
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
// UPDATE MAIN DASHBOARD
// =========================================================

function updateHealthUI(data) {

    if (!data) {
        return;
    }

    // ---------------------------------------------
    // HEALTH
    // ---------------------------------------------

    if (healthScore) {

        healthScore.textContent =
            data.health;

    }

    // ---------------------------------------------
    // API
    // ---------------------------------------------

    if (apiValue) {

        apiValue.textContent =
            `${data.api}ms`;

    }

    // ---------------------------------------------
    // ERRORS
    // ---------------------------------------------

    if (errorValue) {

        errorValue.textContent =
            data.errors;

    }

    // ---------------------------------------------
    // HEALTH BAR
    // ---------------------------------------------

    if (healthBarFill) {

        healthBarFill.style.width =
            `${data.health}%`;

        healthBarFill.style.background =
            data.status === "healthy"
                ? "#3cff9b"
                : "#ff5c69";

    }

    // ---------------------------------------------
    // HEALTHY
    // ---------------------------------------------

    if (data.status === "healthy") {

        if (healthScore) {

            healthScore.style.color =
                "#3cff9b";

        }

        if (healthyMessage) {

            healthyMessage.innerHTML = `
                <span class="status-dot"></span>
                Everything looks good
            `;

        }

        if (apiStatus) {

            apiStatus.textContent =
                "● HEALTHY";

            apiStatus.style.color =
                "#3cff9b";

        }

        if (errorStatus) {

            errorStatus.textContent =
                "● HEALTHY";

            errorStatus.style.color =
                "#3cff9b";

        }

    }

    // ---------------------------------------------
    // DEGRADED
    // ---------------------------------------------

    else {

        if (healthScore) {

            healthScore.style.color =
                "#ff5c69";

        }

        if (healthyMessage) {

            healthyMessage.innerHTML = `
                <span
                    class="status-dot"
                    style="
                        background:#ff5c69;
                        box-shadow:0 0 12px #ff5c69;
                    "
                ></span>

                Change detected
            `;

        }

        if (apiStatus) {

            apiStatus.textContent =
                "● DEGRADED";

            apiStatus.style.color =
                "#ff5c69";

        }

        if (errorStatus) {

            errorStatus.textContent =
                "● ERROR SPIKE";

            errorStatus.style.color =
                "#ff5c69";

        }

    }

}

// =========================================================
// UPDATE TARGET
// =========================================================

function updateTargetUI(data) {

    if (!data) {
        return;
    }

    if (data.status === "healthy") {

        if (targetStatus) {

            targetStatus.textContent =
                "HEALTHY";

            targetStatus.style.color =
                "#3cff9b";

        }

        if (targetBadge) {

            targetBadge.textContent =
                "CONNECTED";

            targetBadge.style.color =
                "#3cff9b";

        }

    } else {

        if (targetStatus) {

            targetStatus.textContent =
                "DEGRADED";

            targetStatus.style.color =
                "#ff5c69";

        }

        if (targetBadge) {

            targetBadge.textContent =
                "DEGRADED";

            targetBadge.style.color =
                "#ff5c69";

        }

    }

}

// =========================================================
// UPDATE IMPACT MAP
// =========================================================

function updateImpactMap(
    data,
    analysis = null
) {

    if (!data) {
        return;
    }

    // =================================================
    // LIVE API
    // =================================================

    if (impactApi) {

        impactApi.textContent =
            `${data.api}ms`;

    }

    // =================================================
    // LIVE ERRORS
    // =================================================

    if (impactErrors) {

        impactErrors.textContent =
            data.errors;

    }

    // =================================================
    // LIVE HEALTH
    // =================================================

    if (impactHealth) {

        impactHealth.textContent =
            data.health;

    }

    // =================================================
    // HEALTHY
    // =================================================

    if (data.status === "healthy") {

        if (impactCause) {

            impactCause.textContent =
                "No anomaly detected";

        }

        if (impactSeverity) {

            impactSeverity.textContent =
                "LOW";

            impactSeverity.style.color =
                "#3cff9b";

        }

        if (impactConfidence) {

            impactConfidence.textContent =
                "98%";

        }

        if (impactStatusText) {

            impactStatusText.textContent =
                "HEALTHY";

            impactStatusText.style.color =
                "#3cff9b";

        }

        return;

    }

    // =================================================
    // DEGRADED
    // =================================================

    if (impactCause) {

        impactCause.textContent =
            analysis?.diagnosis ||
            "Application performance regression detected";

    }

    if (impactSeverity) {

        impactSeverity.textContent =
            analysis?.severity ||
            "CRITICAL";

        impactSeverity.style.color =
            "#ff5c69";

    }

    if (impactConfidence) {

        impactConfidence.textContent =
            `${analysis?.confidence || 99}%`;

    }

    if (impactStatusText) {

        impactStatusText.textContent =
            "DEGRADED";

        impactStatusText.style.color =
            "#ff5c69";

    }

}

// =========================================================
// LOAD HEALTH
// =========================================================

async function loadHealthData() {

    try {

        const response =
            await fetch(
                "/api/health",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Health request failed"
            );

        }

        const result =
            await response.json();

        const data =
            normalizeState(result);

        updateHealthUI(data);

        updateImpactMap(data);

        updateTargetUI(data);

        return data;

    } catch (error) {

        console.error(
            "Health loading failed:",
            error
        );

        return null;

    }

}

// =========================================================
// LIVE MONITORING
// =========================================================

function startLiveMonitoring() {

    if (livePolling) {

        clearInterval(
            livePolling
        );

    }

    livePolling =
        setInterval(
            async () => {

                const data =
                    await loadHealthData();

                if (!data) {
                    return;
                }

                // IMPORTANT:
                // Live target state always wins.

                if (
                    systemMode !==
                    "investigating"
                ) {

                    systemMode =
                        data.status;

                }

            },
            1000
        );

}

// =========================================================
// EVENTS
// =========================================================

async function loadEvents() {

    try {

        const response =
            await fetch(
                "/api/events",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            return;
        }

        const events =
            await response.json();

        if (!eventsList) {
            return;
        }

        eventsList.innerHTML =
            "";

        if (
            !Array.isArray(events) ||
            events.length === 0
        ) {

            eventsList.innerHTML = `
                <div class="event-loading">
                    No application events yet.
                </div>
            `;

            return;

        }

        events.forEach(event => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                `event-item event-${event.type || "info"}`;

            const dot =
                document.createElement(
                    "span"
                );

            dot.className =
                "event-dot";

            const time =
                document.createElement(
                    "span"
                );

            time.className =
                "event-time";

            time.textContent =
                event.time || "";

            const message =
                document.createElement(
                    "span"
                );

            message.className =
                "event-message";

            message.textContent =
                event.message || "";

            item.appendChild(dot);

            item.appendChild(time);

            item.appendChild(message);

            eventsList.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Events loading failed:",
            error
        );

    }

}

// =========================================================
// WAITING STATE
// =========================================================

function showWaitingState() {

    if (!analysisContent) {
        return;
    }

    analysisContent.innerHTML = `

        <div class="analysis-empty">

            <div class="analysis-empty-icon">
                ◌
            </div>

            <div>

                <strong>
                    Waiting for system activity
                </strong>

                <p>
                    Run a simulation to let MIRROR
                    investigate a change and explain
                    its probable impact.
                </p>

            </div>

        </div>

    `;

}

// =========================================================
// INVESTIGATION
// =========================================================

function showInvestigationStep(
    number,
    total,
    icon,
    title,
    message
) {

    if (!analysisContent) {
        return;
    }

    const progress =
        Math.round(
            (number / total) * 100
        );

    analysisContent.innerHTML = `

        <div class="investigation-state">

            <div class="investigation-title">

                <span>
                    ${icon}
                </span>

                ${title}

            </div>

            <div class="investigation-message">

                ${message}

            </div>

            <div class="investigation-progress">

                <div
                    class="investigation-progress-fill"
                    style="width:${progress}%"
                ></div>

            </div>

            <div class="investigation-counter">

                INVESTIGATION
                ${number}/${total}

            </div>

        </div>

    `;

}

// =========================================================
// SLEEP
// =========================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );

}

// =========================================================
// INVESTIGATION SEQUENCE
// =========================================================

async function runInvestigation(
    data,
    analysis
) {

    const steps = [

        {
            icon: "⚡",
            title: "CHANGE DETECTED",
            message:
                "MIRROR detected a significant application state change."
        },

        {
            icon: "◉",
            title: "ANALYSING API PERFORMANCE",
            message:
                `Response latency is now ${data.api}ms.`
        },

        {
            icon: "◉",
            title: "COMPARING PREVIOUS STATE",
            message:
                `Previous API latency was ${BASELINE.api}ms. Current latency is ${data.api}ms.`
        },

        {
            icon: "◉",
            title: "DETECTING ERROR SPIKE",
            message:
                `Error activity changed from ${BASELINE.errors} to ${data.errors}.`
        },

        {
            icon: "◉",
            title: "TRACING SYSTEM IMPACT",
            message:
                `System health is now ${data.health}/100.`
        },

        {
            icon: "🎯",
            title: "ROOT CAUSE IDENTIFIED",
            message:
                "MIRROR completed its impact analysis."

        }

    ];

    for (
        let i = 0;
        i < steps.length;
        i++
    ) {

        showInvestigationStep(

            i + 1,

            steps.length,

            steps[i].icon,

            steps[i].title,

            steps[i].message

        );

        await sleep(500);

    }

    showAnalysis(
        data,
        analysis
    );

}

// =========================================================
// FINAL ANALYSIS
// =========================================================

function showAnalysis(
    data,
    analysis
) {

    if (!analysisContent) {
        return;
    }

    const currentApi =
        Number(data.api);

    const currentErrors =
        Number(data.errors);

    analysisContent.innerHTML = `

        <div class="analysis-result">

            <div class="analysis-result-title">

                🎯 ROOT CAUSE IDENTIFIED

            </div>

            <p class="analysis-diagnosis">

                ${analysis.diagnosis}

            </p>

            <div class="analysis-box">

                <strong class="analysis-box-title">

                    ✦ MIRROR ANALYSIS

                </strong>

                <p>

                    API latency increased from

                    <strong>
                        ${BASELINE.api}ms
                    </strong>

                    to

                    <strong class="danger-text">

                        ${currentApi}ms

                    </strong>.

                </p>

                <p>

                    Error count increased from

                    <strong>
                        ${BASELINE.errors}
                    </strong>

                    to

                    <strong class="danger-text">

                        ${currentErrors}

                    </strong>.

                </p>

                <p>

                    System health changed from

                    <strong>
                        ${BASELINE.health}/100
                    </strong>

                    to

                    <strong class="danger-text">

                        ${data.health}/100

                    </strong>.

                </p>

                <p>

                    Severity:

                    <strong class="danger-text">

                        ${analysis.severity}

                    </strong>

                </p>

                <p>

                    Confidence:

                    <strong class="success-text">

                        ${analysis.confidence}%

                    </strong>

                </p>

                <p>

                    Recommendation:

                    <strong>

                        ${analysis.recommendation}

                    </strong>

                </p>

            </div>

        </div>

    `;

}

// =========================================================
// SIMULATE
// =========================================================

async function simulateChange() {

    systemMode =
        "investigating";

    setButton(
        "INVESTIGATING...",
        "#ffd166",
        "#17120a",
        true
    );

    try {

        const response =
            await fetch(
                "/api/simulate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Simulation request failed"
            );

        }

        const result =
            await response.json();

        const data =
            normalizeState(
                result.state ||
                FAILURE
            );

        const analysis = {

            ...FAILURE_ANALYSIS,

            ...(result.analysis || {})

        };

        // ---------------------------------------------
        // IMMEDIATE LIVE UPDATE
        // ---------------------------------------------

        updateHealthUI(data);

        updateImpactMap(
            data,
            analysis
        );

        updateTargetUI(data);

        await loadEvents();

        // ---------------------------------------------
        // INVESTIGATION
        // ---------------------------------------------

        await runInvestigation(
            data,
            analysis
        );

        systemMode =
            "degraded";

        setButton(
            "RECOVER SYSTEM",
            "#ff5c69",
            "#ffffff",
            false
        );

    } catch (error) {

        console.error(
            "Simulation failed:",
            error
        );

        systemMode =
            "healthy";

        setButton(
            "SIMULATE CHANGE →",
            "#3cff9b",
            "#06110b",
            false
        );

    }

}

// =========================================================
// RECOVER
// =========================================================

async function recoverSystem() {

    systemMode =
        "recovering";

    setButton(
        "RECOVERING...",
        "#ffd166",
        "#17120a",
        true
    );

    try {

        const response =
            await fetch(
                "/api/recover",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Recovery failed"
            );

        }

        const result =
            await response.json();

        const data =
            normalizeState(
                result.state ||
                BASELINE
            );

        updateHealthUI(data);

        updateImpactMap(data);

        updateTargetUI(data);

        if (analysisContent) {

            analysisContent.innerHTML = `

                <div class="recovery-result">

                    ✓ SYSTEM RECOVERED

                </div>

                <p class="recovery-message">

                    MIRROR verified that the
                    application has returned
                    to a healthy state.

                </p>

            `;

        }

        await loadEvents();

        systemMode =
            "healthy";

        setButton(
            "SIMULATE CHANGE →",
            "#3cff9b",
            "#06110b",
            false
        );

    } catch (error) {

        console.error(
            "Recovery failed:",
            error
        );

        systemMode =
            "degraded";

        setButton(
            "RECOVER SYSTEM",
            "#ff5c69",
            "#ffffff",
            false
        );

    }

}

// =========================================================
// BUTTON
// =========================================================

if (simulateButton) {

    simulateButton.addEventListener(
        "click",
        async () => {

            if (
                simulateButton.disabled
            ) {

                return;

            }

            if (
                systemMode ===
                "healthy"
            ) {

                await simulateChange();

            } else if (
                systemMode ===
                "degraded"
            ) {

                await recoverSystem();

            }

        }
    );

}

// =========================================================
// INITIALIZE
// =========================================================

async function initializeMirror() {

    systemMode =
        "healthy";

    // ---------------------------------------------
    // HARD BASELINE
    // ---------------------------------------------

    updateHealthUI(
        BASELINE
    );

    updateImpactMap(
        BASELINE
    );

    updateTargetUI(
        BASELINE
    );

    setButton(
        "SIMULATE CHANGE →",
        "#3cff9b",
        "#06110b",
        false
    );

    showWaitingState();

    await loadHealthData();

    await loadEvents();

    // ---------------------------------------------
    // START LIVE MONITORING
    // ---------------------------------------------

    startLiveMonitoring();

}

// =========================================================
// START
// =========================================================

initializeMirror();