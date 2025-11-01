import React, { useContext, useDebugValue } from 'react'
import { UserContext } from '../Context/user.context';

const UserAuth = ({ children }) => {
    
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    if (user) {
        setLoading(false);
    }

    

    if (loading) {
        return <div>Loading...</div>
    }
    useEffect(() => {
        if (!token) {
            Navigate('/login');
        }
        if (!user) {
            Navigate('login');
        }
    })

    return <>
        {children}
    </>;
}

export default UserAuth