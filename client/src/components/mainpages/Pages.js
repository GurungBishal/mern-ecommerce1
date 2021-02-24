import React, { useContext } from "react";
import { Switch, Route } from "react-router-dom";
import Products from "./products/Products";
import DetailProduct from "./detailProduct/DetailProduct";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Cart from "./cart/Cart";
import NotFound from "./utils/not_found/NotFound";
import { GlobalState } from "../../GlobalState";
import OrderHistory from "./history/OrderHistory";
import OrderDetails from "./history/OrderDetails";
import Categories from "./categories/Categories";
import CreateProduct from "./createProduct/CreateProduct";

function Pages() {
  const state = useContext(GlobalState);
  const [isLogged] = state.userAPI.isLogged;
  const [isAdmin] = state.userAPI.isAdmin;
  return (
    <Switch>
      <Route exact path="/" component={Products} />
      <Route path="/detail/:id" component={DetailProduct} />
      <Route path="/login" component={isLogged ? NotFound : Login} />
      <Route path="/register" component={isLogged ? NotFound : Register} />
      <Route path="/cart" component={Cart} />
      <Route
        exact
        path="/category"
        component={isAdmin ? Categories : NotFound}
      />

      <Route
        path="/create_product"
        component={isAdmin ? CreateProduct : NotFound}
      />

      <Route
        path="/edit_product/:id"
        component={isAdmin ? CreateProduct : NotFound}
      />
      <Route
        exact
        path="/history"
        component={isLogged ? OrderHistory : NotFound}
      />
      <Route
        path="/history/:id"
        component={isLogged ? OrderDetails : NotFound}
      />

      <Route path="*" component={NotFound} />
    </Switch>
  );
}

export default Pages;
