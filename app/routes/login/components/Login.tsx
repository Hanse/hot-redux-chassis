import styles from './Login.css';
import React from 'react';
import LoginForm from 'app/components/LoginForm';

type Props = {
  login: (username: string, passowrd: string, next: string) => void;
  location: any;
};

function Login(props: Props) {
  const handleLogin = (username: string, password: string) => {
    props.login(username, password, props.location.query.next);
  };

  return (
    <div className={styles.root}>
      <h2>Welcome, please sign in</h2>
      <div className={styles.form}>
        <LoginForm onSubmit={handleLogin} />
      </div>
      <p>Sign up is currently not available.</p>
    </div>
  );
}

export default Login;
