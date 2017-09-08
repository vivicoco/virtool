/**
 * @license
 * The MIT License (MIT)
 * Copyright 2015 Government of Canada
 *
 * @author
 * Ian Boyes
 *
 * @exports ManageHosts
 */

import React from "react";
import { Switch, Route } from "react-router-dom";

import SubtractionList from "./List";
import SubtractionDetail from "./Detail";
import Files from "../../files/components/Files";

const Subtraction = () => (
    <div className="container">
        <Switch>
            <Route path="/subtraction" component={SubtractionList} exact />
            <Route path="/subtraction/files" render={() => <Files fileType="subtraction" />} />
            <Route path="/subtraction/:subtractionId" component={SubtractionDetail} />
        </Switch>
    </div>
);

export default Subtraction;