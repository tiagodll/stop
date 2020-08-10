import PlayerApp from './PlayerApp.svelte';
import HostApp from './HostApp.svelte';


//var searchParams = new URLSearchParams(window.location.href.substr(window.location.href.indexOf("?")));
var searchParams = new URLSearchParams(document.URL.substr(document.URL.indexOf("?")));
let app;

if(window.location.href.indexOf("play?") > -1)
{
    const playerApp = new PlayerApp({
        target: document.body,
        props: {
            game_id: searchParams.get('game_id'),
            password: searchParams.get('password'),
        }
    });
    app = playerApp;
}else{
    const appHost = new HostApp({
        target: document.body,
        props: {
            game_id: searchParams.get('game_id'),
            password: searchParams.get('password'),
        }
    });
    app = appHost;
}

export default app;