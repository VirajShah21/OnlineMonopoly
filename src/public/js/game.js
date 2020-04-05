const PROPERTY_TYPES = ["Property", "ColoredProperty", "Railroad", "Utility"];

function getPlayerId() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++)
        if (cookies[i].split("=")[0].trim() === "playerId")
            return cookies[i].split("=")[1].trim();
    return null;
}

function getGameId() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++)
        if (cookies[i].split("=")[0].trim() === "gameId")
            return cookies[i].split("=")[1].trim();
}

function updatePlayerMarkers(game) {
    game.players.forEach(player => {
        let markerId = "player-marker-" + player.id;
        let marker = document.getElementById(markerId);


        if (marker == null) {
            marker = document.createElement("div");
            marker.style.display = "inline block";
            marker.style.backgroundColor = player.color;
            marker.id = markerId;
            marker.innerHTML = player.name;
        }

        document.getElementById(`board-position-${player.position}`).appendChild(marker);
    });
}

function makeTitleDeed(prop) {
    let container = document.createElement("div");
    let table = document.createElement("table");

    container.className = "bg-light";

    container.style.float = "left";
    container.style.border = "1px solid lightgray";
    container.style.boxShadow = "0 0 25px 0 black";
    container.style.padding = "1em";
    container.style.width = "200px";
    container.style.height = "300px";

    table.style.width = "100%";
    table.style.height = "100%";

    if (prop.TileType == "ColoredProperty") {
        let colorRow = document.createElement("tr");
        let colorCell = document.createElement("td");
        colorCell.colSpan = 2;
        colorCell.innerHTML = `TITLE DEED<br>${prop.name}`;
        colorRow.appendChild(colorCell);
        table.appendChild(colorRow);

        table.innerHTML += `<tr>
            <td colspan="2" class="text-center">RENT $${prop.rents[0]}</td>
        </tr>
        
        <tr>
            <td>1 House</td>
            <td class="text-right">$${prop.rents[1]}</td>
        </tr>
        
        <tr>
            <td>2 Houses</td>
            <td class="text-right">$${prop.rents[2]}</td>
        </tr>
        
        <tr>
            <td>3 Houses</td>
            <td class="text-right">$${prop.rents[3]}</td>
        </tr>
        
        <tr>
            <td>4 Houses</td>
            <td class="text-right">$${prop.rents[4]}</td>
        </tr>
        
        <tr>
            <td>w/ Hotel</td>
            <td class="text-right">$${prop.rents[5]}</td>
        </tr>`;
    } else if (prop.TileType == "Utility") {
        let iconRow = document.createElement("tr");
        let iconCell = document.createElement("td");
        let icon = document.createElement("img");
        icon.height = "50px";
        iconCell.appendChild(icon);
        iconRow.appendChild(icon);

        if (prop.name == "Waterworks")
            icon.src = "https://lh3.googleusercontent.com/proxy/DQDh59mwpgzc8H66_igaj4uHw1t9yNG-f_0VQWut8DoTU88I2tzTyJcVhUHgpIv6f-aFYGUWqFDKn6sNX33hOhbs3v8U2z5xxg";
        else
            icon.src = "https://pngimage.net/wp-content/uploads/2018/06/png-electricity-company.png";

        let propNameRow = document.createElement("tr");
        let propNameCell = document.createElement("td");
        propNameCell.className = "font-weight-bold";
        propNameCell.innerText = prop.name;
        propNameRow.appendChild(propNameCell);

        let infoRow = document.createElement("tr");
        let infoCell = document.createElement("td");
        infoCell.innerText = "If one utility is owned, then rent is 4 times the amount shown on dice.";
        infoRow.appendChild(infoCell);

        let infoRow2 = document.createElement("tr");
        let infoCell2 = document.createElement("td");
        infoCell2.innerText = "If two utilities are owned, then rent is 10 times the amount shown on the dice.";
        infoRow.appendChild(infoCell2);

        [iconRow, propNameRow, infoRow, infoRow2].forEach(tr => {
            table.appendChild(tr);
        });
    } else if (prop.TileType == "Railroad") {
        let iconRow = document.createElement("tr");
        let iconCell = document.createElement("td");
        let icon = document.createElement("img");
        icon.height = "50px";
        iconCell.appendChild(icon);
        iconRow.appendChild(icon);
        icon.src = "https://i.ya-webdesign.com/images/railroad-clipart-transparent-2.png";
        iconCell.colSpan = 2;

        table.appendChild(iconRow);

        table.innerHTML += `<tr>
            <td>RENT</td>
            <td class="text-right">$25</td>
        </tr>
        
        <tr>
            <td>2 Railroads</td>
            <td class="text-right">$50</td>
        </tr>
        
        <tr>
            <td>3 Railroads</td>
            <td class="text-right">$100</td>
        </tr>
        
        <tr>
            <td>4 Railroads</td>
            <td class="text-right">$200</td>
        </tr>`;
    }

    container.appendChild(table);

    return container;
}

function handleGameState() {
    $.get("/game/state", game => {
        console.log("Response to /game/state");
        console.log(game);

        // Get the player object
        let player = game.players.filter(currPlayer => {
            return currPlayer.id === getPlayerId()
        })[0];

        if (game.id) {
            if (game.initialized) {
                let monopolyBoardSelector = $("#monopoly-board-container");
                let turnOptionsSelector = $("#turn-options");
                let rollDiceSelector = $("#turn-options_roll-dice");

                if (monopolyBoardSelector.attr("hidden"))
                    monopolyBoardSelector.attr("hidden", false);
                if (turnOptionsSelector.attr("hidden"))
                    turnOptionsSelector.attr("hidden", false);
                $("#property-navigator").attr("hidden", false);

                updatePlayerMarkers(game);

                let currPlayerId = game.players[game.currPlayer].id;
                if (player.id === currPlayerId) {
                    if (game.diceLock)
                        rollDiceSelector.attr("class", "btn btn-danger");
                    else
                        rollDiceSelector.attr("class", "btn btn-success");
                } else {
                    $(".current-player-name").text(game.players[game.currPlayer].name);
                    turnOptionsSelector.attr("hidden", true);
                }

                let propertiesWrapperSelector = $("#properties-wrapper");
                propertiesWrapperSelector.html("");
                game.players.filter(player => {
                    return player.id === getPlayerId();
                })[0].propertyManager.groups.forEach(propertyGroup => {
                    propertyGroup.properties.forEach(property => {
                        let titleDeed = makeTitleDeed(property);
                        propertiesWrapperSelector.append(titleDeed);
                    });
                });
            } else { // Game is not initialized
                let gameLobbySelector = $("#game-lobby");
                if (gameLobbySelector.attr("hidden"))
                    gameLobbySelector.attr("hidden", false);
            }
        } else {
            alert(game.message);
        }

        // Fill in all the text fields
        $(".player-name").text(player.name);
        $(".player-balance").text(player.balance);
    });
}

$(document).ready(() => {
    $.get("/game/state", game => {
        console.log("Response to /game/state");
        console.log(game);

        if (game.id) {
            $(".game-id").text(game.id);
            if (game.initialized) {
                handleGameState();
            } else {
                game.players.forEach(player => {
                    let li = document.createElement("li");
                    li.innerText = player.name;
                    $(".players-list").append(li);
                });
            }
        } else {
            alert(game.message);
        }
    });

    $("#game-lobby_start-game").click(() => {
        $.get("/event/start-game", response => {
            console.log("Response to /event/start-game");
            console.log(response);
            if (!response.success) {
                alert(response.message);
            } else {
                $("#game-lobby").attr("hidden", true);
                handleGameState();
            }
        });
    });

    $("#turn-options_roll-dice").click(() => {
        $.get("/event/roll-dice", response => {
            console.log("Response to /event/roll-dice");
            console.log(response);

            handleGameState();

            if (PROPERTY_TYPES.indexOf(response.tile.TileType) >= 0) {
                if (response.tile.owner) {
                    if (response.tile.owner.id === getPlayerId()) {
                        Swal.fire({
                            title: `You rolled a ${response.roll1} and ${response.roll2}`,
                            text: `You moved ${response.roll1 + response.roll2} spaces to ${response.tile.name}. You own this property. Are you done with your turn?`,
                            icon: 'info',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            cancelButtonText: "I'm not done with my turn",
                            confirmButtonText: "I am done with my turn"
                        }).then((result) => {
                            if (result.value) {
                                $.get("/event/turn-finished", turnFinishedResponse => {
                                    console.log("Response to /turn-finished");
                                    console.log(turnFinishedResponse);

                                    if (turnFinishedResponse.success) {
                                        handleGameState();
                                    } else {
                                        console.log(turnFinishedResponse.message);
                                    }
                                })
                            } else {
                                handleGameState();
                            }
                        });
                    } else {
                        // noinspection JSUnresolvedFunction
                        Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 10000,
                            timerProgressBar: true,
                            onOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer);
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        }).fire({
                            icon: 'success',
                            title: `You rolled ${response.roll1} and ${response.roll2} = ${response.roll1 + response.roll2}`
                        });

                        Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 10000,
                            timerProgressBar: true,
                            onOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer);
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        }).fire({
                            icon: 'success',
                            title: `You moved to ${response.tile.name}`
                        });

                        Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 10000,
                            timerProgressBar: true,
                            onOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer);
                                toast.addEventListener('mouseleave', Swal.resumeTimer);
                            }
                        }).fire({
                            icon: 'success',
                            title: `You paid $${response.rentPaid} to ${response.tile.owner.name} for rent on ${response.tile.name}`
                        });
                    }
                } else {
                    // TODO: offer the user an option to purchase the property
                    Swal.fire({
                        title: `You rolled a ${response.roll1} and ${response.roll2}`,
                        text: `You moved ${response.roll1 + response.roll2} spaces to ${response.tile.name}. Would you like to purchase the property?`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        cancelButtonText: "No",
                        confirmButtonText: "Yes"
                    }).then((result) => {
                        if (result.value) {
                            $.get("/event/purchase-property", purchasePropertyResponse => {
                                console.log("Response to /purchase-property");
                                console.log(purchasePropertyResponse);

                                if (purchasePropertyResponse.success) {
                                    handleGameState();
                                } else {
                                    console.log(purchasePropertyResponse.message);
                                }
                            });
                        } else {
                            handleGameState();
                        }
                    });
                }
            } else {
                let position = response.position;
                if ([2, 17].indexOf(position) >= 0) { // Community Chest
                    // TODO: implement community chest features
                } else if ([7, 36].indexOf(position) >= 0) { // Chance
                    // TODO: implement chance features
                } else if (position === 0) { // Go
                    // TODO: Collect 200
                } else if (position === 20) { // Free Parking
                    // TODO: handle free parking rules
                } else if (position === 30) { // Go To Jail
                    // TODO: handle go to jail features
                } else if (position === 4) { // $200 Income tax
                    // TODO: deduct $200 from player's balance
                } else if (position === 38) { // $100 Luxury tax
                    // TODO: deduct $100 from player's balance
                }
                handleGameState();
            }
        })
    });

    handleGameState();
});