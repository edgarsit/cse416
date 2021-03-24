import React, { useState } from 'react';

export default class Login extends React.Component<{ history: string[] }, { error: string, loading: boolean }> {
    render() {
        const username = useFormInput('');
        const password = useFormInput('');
        const { error, loading } = this.state;

        // handle button click of login form
        const handleLogin = () => {
            this.props.history.push('/dashboard');
        }

        return (
            <div>
                <a href="/auth/google" className="button">Sign in with Google</a>

                Login<br /><br />
                <div>
                    Username<br />
                    <input type="text" {...username} autoComplete="new-password" />
                </div>
                <div style={{ marginTop: 10 }}>
                    Password<br />
                    <input type="password" {...password} autoComplete="new-password" />
                </div>
                {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
                <input type="button" value={loading ? 'Loading...' : 'Login'} onClick={handleLogin} disabled={loading} /><br />
            </div>
        );
    }
}

const useFormInput = (initialValue: any) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e: any) => {
        setValue(e.target.value);
    }
    return {
        value,
        onChange: handleChange
    }
}
