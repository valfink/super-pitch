import { Button } from "reactstrap";

function AppStarter({ onListenBtnClick, onSingBtnClick, onLoginBtnClick, onRegisterBtnClick, onLogoutBtnClick }) {

    return (
        <>
            <div className="d-flex flex-column growing-row-overflow-hidden">
                <div className="m-2 position-relative">
                    <h1 className="app-title">Super Pitch</h1>
                </div>
                <div className="flex-fill m-2 position-relative">
                    <Button onClick={onListenBtnClick} color="success" className="starter-button">
                        <div className="w-25 d-inline-block text-start"><i className="bi bi-ear"></i></div><div className="w-75 d-inline-block text-end">Listen Challenge</div>
                    </Button>
                </div>
                <div className="flex-fill m-2 position-relative">
                    <Button onClick={onSingBtnClick} color="info" className="starter-button">
                        <div className="w-25 d-inline-block text-start"><i className="bi bi-mic"></i></div><div className="w-75 d-inline-block text-end">Sing Challenge</div>
                    </Button>
                </div>
                {onLoginBtnClick ?
                    <><div className="flex-fill m-2 position-relative">
                        <Button onClick={onLoginBtnClick} color="primary" className="starter-button">
                            <div className="w-25 d-inline-block text-start"><i className="bi bi-person"></i></div><div className="w-75 d-inline-block text-end">Log In</div>
                        </Button>
                    </div>
                        <div className="flex-fill m-2 position-relative">
                            <Button onClick={onRegisterBtnClick} color="warning" className="starter-button">
                                <div className="w-25 d-inline-block text-start"><i className="bi-person-add"></i></div><div className="w-75 d-inline-block text-end">Register</div>
                            </Button>
                        </div></>
                    : <div className="flex-fill m-2 position-relative">
                        <Button onClick={onLogoutBtnClick} color="danger" className="starter-button">
                            <div className="w-25 d-inline-block text-start"><i className="bi bi-person-x"></i></div><div className="w-75 d-inline-block text-end">Log Out</div>
                        </Button>
                    </div>
                }
            </div>
        </>
    )
}

export default AppStarter;