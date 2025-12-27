import Header from './components/Header';
import PaymentForm from './components/PaymentForm';
import './styles/main.css';

function App() {
  return (
    <>
      <Header />
      <main className="main-container">
        <PaymentForm />
      </main>
    </>
  );
}

export default App;