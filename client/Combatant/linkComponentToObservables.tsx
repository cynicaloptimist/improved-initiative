import * as React from "react";
import * as ko from "knockout";
import { noop } from "lodash";
import { useEffect } from "react";

export function linkComponentToObservables(component: React.Component) {
  let observableSubscription = ko.observable().subscribe(noop);
  const oldComponentDidMount = component.componentDidMount || noop;
  component.componentDidMount = () => {
    observableSubscription = ko
      .computed(() => component.render())
      .subscribe(() => component.forceUpdate());
    oldComponentDidMount();
  };
  const oldComponentWillUnmount = component.componentWillUnmount || noop;
  component.componentWillUnmount = () => {
    observableSubscription.dispose();
    oldComponentWillUnmount();
  };
}

export function useSubscription<T>(observable: KnockoutObservable<T>): T {
  const [value, setValue] = React.useState(observable());
  useEffect(() => {
    const subscription = observable.subscribe(newValue => setValue(newValue));
    return () => subscription.dispose();
  }, [observable]);
  return value;
}
