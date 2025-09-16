import {registerRootComponent} from 'expo';

export {default} from './app.tsx';
registerRootComponent(require('./app.tsx').default);
