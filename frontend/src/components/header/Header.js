import React, { useState, useEffect } from 'react';

import { isAuthenticated, logout, getUser } from '../../services/auth'

import './header.css';
import Coin from '../../assets/icons/coin.svg';
import api from '../../services/api';

const handleLogout = (history) => {
    logout(history);
}

const handleRecharge = (history) => {
    history.push('/recharge');
}

export default function Header(props) {
    const [authenticated, setAuthenticated] = useState(isAuthenticated());
    const [currentUser, setCurrentUser] = useState({});

    useEffect(() => {
        setAuthenticated(isAuthenticated());

        getUser().then((response) => {
            if(response)
                setCurrentUser(response.data);
         });

    }, [isAuthenticated()]);

    const { history } = props;
    const {pathname} = props.location;

    return(
        <div className="header">
            <div className="left">
                <label className="logo">SIPCOPA</label>
                <TopNavigation pathname={pathname} history={history} />
            </div>
            <div className="right">
                <UserInfo history={history} authenticated={authenticated} currentUser={currentUser}/>
                <Menu authenticated={authenticated} pathname={pathname} history={history} />
                <UserPoints authenticated={authenticated} currentUser={currentUser} history={history} />
            </div>
        </div>
    );
}

const Menu = ({ authenticated, pathname, history }) => {
    return(
        <div className="menu">
            {
                authenticated ?
                    <MenuConnected pathname={pathname} history={history} /> :
                <MenuDisconnected pathname={pathname} history={history} />
            }
        </div>
    );
}

const MenuDisconnected = ({ pathname, history }) => {
    return(
        <ul>
            {
                pathname === '/' ?
                    <li className="selected">Página inical</li> :
                    <li onClick={ () => {history.push('/')} }>Página inical</li>
            }
            {
                pathname.toUpperCase().startsWith('/SERVICE') ?
                    <li className="selected">Serviço</li> :
                    <li onClick={ () => {history.push('/service/profissionais/Nome completo')} }>Serviço</li>
            }
            {
                pathname === '/about' ?
                    <li className="selected">Sobre</li> :
                    <li onClick={ () => {history.push('/about')} }>Sobre</li>
            }
            {
                pathname === '/connect' ?
                    <li className="selected">Conectar</li> :
                    <li onClick={ () => { history.push('/connect')} }>Conectar</li>
            }
        </ul>
    );
}

const MenuConnected = ({ pathname, history }) => {
    return(
        <ul>
            {
                pathname.toUpperCase().startsWith('/SERVICE') ?
                    <li className="selected" onClick={ () => {history.push('/service')} }>Serviço</li> :
                    <li onClick={ () => {history.push('/service')} }>Serviço</li>
            }
            {
                pathname.toUpperCase() === '/MY_ACCOUNT' ?
                    <li className="selected">Meu perfil profissional</li> :
                    <li onClick={ () => { history.push('/my_account')} }>Meu perfil profissional</li>
            }
            {
                pathname.toUpperCase() === '/HISTORY' ?
                    <li className="selected">Histórico</li> :
                    <li onClick={ () => { history.push('/history')} }>Histórico</li>
            }
        </ul>
    );
}

const TopNavigation = ({ pathname, history }) => {
    const navigationPath = pathname.substring(1, pathname.lenght).split('/');

    const getNavigationPath = (currentIndex) => {
        var path = '';

        for(var count=0; count <= currentIndex; count++) {
            path += '/';
            path += navigationPath[count];
        }

        return path;
    };

    getNavigationPath();

    return(
        <div className="top-navigation" style={ !(pathname.toUpperCase().startsWith('/SERVICE')) ? { visibility:'hidden' } : null }>
            {
                navigationPath.map((element, index) => {
                    if(index !== navigationPath.length - 1)
                        return(
                            <label key={index}>
                                <Shrotcut history={history} index={index} element={element} getNavigationPath={getNavigationPath} />
                                <label style={{ margin:'0 20px'}}>/</label>
                            </label>
                        );
                    else
                        return(
                            <label key={index}>
                                {/* <label style={{ color:'#2AABCC' }} className="selectable" onClick={() => { history.push(getNavigationPath(index)) }} >
                                    {element}
                                </label> */}
                                <Shrotcut selected history={history} index={index} element={element} getNavigationPath={getNavigationPath} />
                            </label>
                        );
                })
            }
        </div>
    );
}

const Shrotcut = ({ selected, history, element, index, getNavigationPath }) => {
    const [loading, setLoading] = React.useState(true);
    const [shortcut, setShortcut] = React.useState(element);

    React.useEffect(() => {
        if(shortcut !== 'service' && shortcut !== 'contract') {
            (async() => {
                api.post('/professional_profile/getByUser', {}, {
                    headers: {
                        professional_profile_id: element
                    }
                }).then(response => {
                    if(response.data.professionalProfile) {
                        setShortcut(response.data.professionalProfile.fullName);
                        setLoading(false);
                    }
                });

                api.post('/job/show', {}, {
                    headers: {
                        job_id: element
                    }
                }).then(response => {
                    if(response.data.job) {
                        setShortcut(response.data.job.job);
                        setLoading(false);
                    }
                });

                setLoading(false);
            })();
        } else
            setLoading(false);
    }, []);
    
    return(
        <>
        {
            loading ? 'loading' :
                selected ?
                    <label style={{ color:'#2AABCC', cursor:'default' }} className="shortcut" >{shortcut}</label>
                :
                    <label className="shortcut" onClick={() => { history.push(getNavigationPath(index)) }}>{shortcut}</label>
        }
        </>
    );
}

const UserInfo = ({ history, authenticated, currentUser }) => {
    return(
        <div className='user-info-container' style={styleHiddenIfDesconected({}, authenticated)}>
            {
                currentUser.user ? 
                    <label>conectado como {authenticated ? currentUser.user.username : null }</label> :
                <label>conectado como</label>
            }
            <label className='btn-desconectar' onClick={(e) => {handleLogout(history)}}>desconectar</label>
        </div>
    );
}

const UserPoints = ({ authenticated, currentUser, history }) => {
    
    return(
        <div className="user-points-container" style={styleHiddenIfDesconected({}, authenticated)} onClick={(e) => { handleRecharge(history); }} >
            {
                currentUser.user ? 
                    <label>{currentUser.user.bitpoints}</label> :
                <label>0</label>
            }
            <img src={Coin} alt="Your coins" />
        </div>
    );
}

const styleHiddenIfDesconected = (style, authenticated) => {

    if(!authenticated)
        return Object.assign({}, style, { visibility:'hidden' });

    return style;
}