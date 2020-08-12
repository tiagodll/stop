import PlayerApp from './PlayerApp.svelte';
import HostApp from './HostApp.svelte';
import LandingPage from './LandingPage.svelte';


var searchParams = new URLSearchParams(document.URL.substr(document.URL.indexOf("?")));
let app;

if(window.location.href.indexOf("/play?") > -1)
{
    const playerApp = new PlayerApp({
        target: document.body,
        props: {
            game_id: searchParams.get('game_id'),
            password: searchParams.get('password'),
        }
    });
    app = playerApp;
}else if(window.location.href.indexOf("/host") > -1){
    const appHost = new HostApp({
        target: document.body,
        props: {
            game_id: searchParams.get('game_id'),
            password: searchParams.get('password'),
        }
    });
    app = appHost;
}else{
    app = new LandingPage({ target: document.body, props: {} });
}

export default app;