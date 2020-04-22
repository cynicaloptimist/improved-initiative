import * as React from "react";
import * as ko from "knockout";
import { noop } from "lodash";

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
  const [value, setValue] = React.useState({ current: observable() });

  React.useEffect(() => {
    const subscription = observable.subscribe(newValue => {
      // In case newValue is a reference to the same object as before
      // such as with KnockoutObservableArray, we instantiate a wrapper
      // object for setValue.
      setValue({ current: newValue });
    });
    return () => subscription.dispose();
  }, [observable]);

  return value.current;
}
