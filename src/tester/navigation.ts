type SceneTree = Record<string, any>;

const sceneStructure: SceneTree = {
    "Single Scene": {
        Prototype: ["Elipse-Track"],
        Joystick: ["Virtual-Joystick", "Steerable-Rect", "Test-Car"],
        Mouse: ["Mouse-Cursor"],
        Sound: ["Sound-Demo"],
        PCGame: [
            "Rectangle-Track",
            "Car",
            "Track-Boundary",
            "Starting-Grid",
            "Road-Markings",
            "Track-Grass",
            "Lap-Tracker",
            "Game-Score",
            "Menu",
            "Countdown",
            "Continue",
        ],
    },
    "Multi Scene": {
        Joystick: ["Joystick-Test", "XY-Joystick-Test", "Joystick-For-Car"],
        PCGame: [
            "Track-Cursor",
            "Start-Race",
            "Car-Out-Of-Track",
            "Lap-Measurement",
            "Race-Restart",
        ],
    },
    Game: ["TurboLaps-Pc", "TurboLaps-Mobile"],
};

let currentLevel: any = sceneStructure;
let path: string[] = [];
let currentButtons: HTMLButtonElement[] = [];

let navigationEnabled = true;
let menuVisible = true;
let navContainer: HTMLDivElement;

function getCurrentScene(): string | null {
    return new URLSearchParams(window.location.search).get("scene");
}

function getCurrentCategory(): string | null {
    return path[0] || null;
}

function getMode(): string {
    const category = getCurrentCategory();
    return category === "Single Scene" ? "current" : "all";
}

function goToScene(scene: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", getMode());
    url.searchParams.set("scene", scene);
    window.location.href = url.toString();
}

function highlightCurrentScene() {
    const currentScene = getCurrentScene();
    currentButtons.forEach((btn) => {
        btn.style.backgroundColor =
            btn.textContent === currentScene ? "yellow" : "";
    });
}

function addBackButton(container: HTMLDivElement) {
    if (path.length === 0) return;
    const backBtn = document.createElement("button");
    backBtn.textContent = "Back";
    backBtn.style.fontWeight = "bold";
    backBtn.onclick = () => {
        path.pop();
        currentLevel = sceneStructure;
        for (const p of path) currentLevel = currentLevel[p];
        navigateMenu(container);
    };
    container.appendChild(backBtn);
}

function navigateMenu(container: HTMLDivElement) {
    container.innerHTML = "";
    currentButtons = [];

    if (Array.isArray(currentLevel)) {
        // Scene list
        currentLevel.forEach((scene) => {
            const btn = document.createElement("button");
            btn.textContent = scene;
            btn.onclick = () => goToScene(scene);
            container.appendChild(btn);
            currentButtons.push(btn);
        });
        highlightCurrentScene();
        addBackButton(container);
    } else {
        // Menu keys
        Object.keys(currentLevel).forEach((key) => {
            const btn = document.createElement("button");
            btn.textContent = key;
            btn.onclick = () => {
                path.push(key);
                currentLevel = currentLevel[key];
                navigateMenu(container);
            };
            container.appendChild(btn);
        });
        addBackButton(container);
    }
}

export function startNavigation() {
    // Create navigation container
    navContainer = document.createElement("div");
    navContainer.style.position = "absolute";
    navContainer.style.bottom = "20px";
    navContainer.style.left = "50%";
    navContainer.style.transform = "translateX(-50%)";
    navContainer.style.display = "flex";
    navContainer.style.flexWrap = "wrap";
    navContainer.style.gap = "10px";
    navContainer.style.zIndex = "100";
    navContainer.style.backgroundColor = "rgba(0,0,0,0.3)";
    navContainer.style.padding = "10px";
    navContainer.style.borderRadius = "5px";
    document.body.appendChild(navContainer);

    // Toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Toggle Menu / Arrows";
    toggleBtn.style.position = "absolute";
    toggleBtn.style.top = "10px";
    toggleBtn.style.right = "10px";
    toggleBtn.style.opacity = "0.5";
    toggleBtn.style.zIndex = "200";
    toggleBtn.onclick = () => {
        menuVisible = !menuVisible;
        navigationEnabled = menuVisible;
        navContainer.style.display = menuVisible ? "flex" : "none";
    };
    document.body.appendChild(toggleBtn);

    // Restore current scene from URL
    currentLevel = sceneStructure;
    path = [];

    const sceneInUrl = getCurrentScene();
    if (sceneInUrl) {
        outer: for (const topKey of Object.keys(sceneStructure)) {
            const topVal = sceneStructure[topKey];
            if (Array.isArray(topVal) && topVal.includes(sceneInUrl)) {
                path = [topKey];
                currentLevel = topVal;
                break outer;
            } else if (typeof topVal === "object") {
                for (const subKey of Object.keys(topVal)) {
                    if (topVal[subKey].includes(sceneInUrl)) {
                        path = [topKey, subKey];
                        currentLevel = topVal[subKey];
                        break outer;
                    }
                }
            }
        }
    }

    navigateMenu(navContainer);

    // Arrow key navigation
    window.addEventListener("keydown", (e) => {
        if (!navigationEnabled) return;
        if (!Array.isArray(currentLevel)) return;
        const currentIndex = currentLevel.findIndex(
            (s: string) => s === getCurrentScene()
        );
        let newIndex = currentIndex;
        if (e.key === "ArrowRight" && currentIndex < currentLevel.length - 1)
            newIndex++;
        else if (e.key === "ArrowLeft" && currentIndex > 0) newIndex--;
        else return;

        goToScene(currentLevel[newIndex]);
        highlightCurrentScene();
    });
}
