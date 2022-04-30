import './App.css';
import { Provider } from 'react-redux';
import Bugs from './components/Bugs';
import configureStore from './store/configureStore'
import BugsList from './components/BugsList';

const store = configureStore()

function App() {
  return (
    <Provider store={store}>
      <Bugs />
    </Provider>
  );
}

export default App;
