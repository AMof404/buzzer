import { db, ref, set, onValue, runTransaction } from "./firebase.js";

// Host: Create Room
document.getElementById("create-room")?.addEventListener("click", () => {
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase(); // Generate random room code
    console.log("Room created with code:", roomCode);

    set(ref(db, `rooms/${roomCode}`), {
        host: "host",
        participants: {},
        buzzed: null
    }).then(() => {
        console.log("Room successfully created in the database.");
        document.getElementById("room-code").textContent = `Room Code: ${roomCode}`;
    }).catch((error) => {
        console.error("Error creating room:", error);
    });

    // Listen for buzzed participant
    const buzzRef = ref(db, `rooms/${roomCode}/buzzed`);
    onValue(buzzRef, (snapshot) => {
        const buzzed = snapshot.val();
        console.log("Buzz detected:", buzzed);
        if (buzzed) {
            const date = new Date(buzzed.timestamp);
            const timeString = date.toLocaleTimeString();
            document.getElementById("buzz-result").textContent = 
                `Buzzed by: ${buzzed.name} at ${timeString}`;
        }
    });

    // Indicate reset to participants
    const resetRef = ref(db, `rooms/${roomCode}/reset`);
    onValue(resetRef, (snapshot) => {
        const resetState = snapshot.val();
        if (resetState) {
            console.log("Reset indication received.");
            set(ref(db, `rooms/${roomCode}/reset`), false); // Reset the state
        }
    });

    // Host: Listen for Participants
    const participantListRef = ref(db, `rooms/${roomCode}/participants`);
    onValue(participantListRef, (snapshot) => {
        const participants = snapshot.val();
        const participantList = document.getElementById("participant-list");
        participantList.innerHTML = ""; // Clear the list

        if (participants) {
            Object.values(participants).forEach(participant => {
                const p = document.createElement("p");
                p.textContent = participant.name;
                participantList.appendChild(p);
            });
        } else {
            participantList.innerHTML = "No participants yet.";
        }
    });
});

// Host: Reset Buzz
document.getElementById("reset-buzz")?.addEventListener("click", () => {
    const roomCode = document.getElementById("room-code").textContent.split(": ")[1];
    console.log("Resetting buzz for room:", roomCode);

    if (roomCode) {
        set(ref(db, `rooms/${roomCode}/buzzed`), null)
            .then(() => {
                console.log("Buzz successfully reset.");
                document.getElementById("buzz-result").textContent = "Buzz reset.";
                return set(ref(db, `rooms/${roomCode}/reset`), true); // Notify participants
            })
            .catch((error) => {
                console.error("Error resetting buzz:", error);
            });
    }
});

// Participant: Join Room
document.getElementById("join-room")?.addEventListener("click", () => {
    const joinCode = document.getElementById("join-code").value.toUpperCase();
    const participantName = document.getElementById("participant-name").value || "Anonymous";
    const participantId = Math.random().toString(36).substr(2, 8); // Generate unique participant ID

    console.log("Attempting to join room with code:", joinCode, "as participant:", participantName);

    const participantRef = ref(db, `rooms/${joinCode}/participants/${participantId}`);
    set(participantRef, { id: participantId, name: participantName }).then(() => {
        console.log("Successfully joined room:", joinCode, "as participant:", participantName);
        document.getElementById("buzz-area").style.display = "block";
        document.getElementById("buzz-status").textContent = `Joined Room: ${joinCode}`;
        sessionStorage.setItem("roomCode", joinCode); // Save room code locally
        sessionStorage.setItem("participantId", participantId); // Save participant ID locally
        sessionStorage.setItem("participantName", participantName); // Save participant name locally
    }).catch((error) => {
        console.error("Error joining room:", error);
    });

    // Listen for reset indication
    const resetRef = ref(db, `rooms/${joinCode}/reset`);
    onValue(resetRef, (snapshot) => {
        const resetState = snapshot.val();
        if (resetState) {
            console.log("Buzz reset received on participant side.");
            document.getElementById("buzz-status").textContent = "Buzz reset by host.";
        }
    });
});

// Participant: Buzz In
document.getElementById("buzz-in")?.addEventListener("click", () => {
    const joinCode = sessionStorage.getItem("roomCode");
    const participantId = sessionStorage.getItem("participantId");
    const participantName = sessionStorage.getItem("participantName");
    console.log("Participant attempting to buzz in:", participantId, "for room:", joinCode);

    if (joinCode && participantId) {
        const buzzRef = ref(db, `rooms/${joinCode}/buzzed`);

        runTransaction(buzzRef, (current) => {
            console.log("Current buzz state:", current);
            if (!current) {
                console.log("Buzz registered for participant:", participantName);
                return { userId: participantId, name: participantName, timestamp: Date.now() };
            }
            console.log("Buzz ignored; someone already buzzed.");
            return; // Ignore if already buzzed
        }).then(() => {
            console.log("Buzz transaction completed.");
            document.getElementById("buzz-status").textContent = "Buzzed!";
        }).catch((error) => {
            console.error("Error buzzing in:", error);
        });
    
    }
});

