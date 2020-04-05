$(document).ready(() => {
    $("#new-game_create").click(() => {
        let name = $("#new-game_name").val();
        $.get("/event/new-game", {
            adminName: name
        }, response => {
            if (response.success)
                window.location = "/game";
            else
                alert(response.message);
        });
    });

    $("#join-game_submit").click(() => {
        let name = $("#join-game_name").val();
        let gameId = $("#join-game_id").val();
        $.get("/event/join-game", {
            name: name,
            gameId: gameId
        }, response => {
            if (response.success)
                window.location = "/game";
            else
                alert(response.message);
        });
    });
});