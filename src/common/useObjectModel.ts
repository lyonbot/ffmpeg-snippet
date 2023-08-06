import { getCurrentInstance, onMounted, reactive, watch } from "vue";
import { cloneDeep, has, pick } from "lodash";

/**
 * like `defineModel` but it automatically complete the missing properties that defined in `defaults`
 *
 * returns a `T` and you can read and update it. all changes will be applied to the modelValue
 */
export function useObjectModel<T extends Record<string, any>>(propKey: string, defaults: T): T {
  const options = reactive(cloneDeep(defaults)) as T;
  const keys = Object.keys(defaults) as (keyof T)[];
  const { props, emit } = getCurrentInstance()!;

  watch(() => pick(props[propKey], keys), syncFromOutside, { flush: "sync" });
  watch(() => ({ ...options }), emitIfUpdated); // depend on all properties
  onMounted(syncFromOutside);

  return options;

  // -----------
  function syncFromOutside() {
    let obj = props[propKey] as T | undefined;
    if (!obj || typeof obj !== "object") {
      // bad value type, reset to defaults
      const outValue = reactive(cloneDeep(defaults) as T);
      emit(`update:${propKey}`, outValue);
      Object.assign(options, outValue);
      return;
    }

    // prop value is obj, but it may lack some property
    for (const key of keys) {
      let hasVal = has(obj, key);
      if (!hasVal) {
        obj[key] = cloneDeep(defaults[key]);
      }

      if (options[key] !== obj[key]) options[key] = obj[key];
    }
  }

  function emitIfUpdated() {
    let obj = props[propKey] as T | undefined;
    if (!obj || typeof obj !== "object") {
      // bad value type, reset to defaults
      const outValue = reactive(cloneDeep(defaults) as T);
      emit(`update:${propKey}`, outValue);
      Object.assign(options, outValue);
      return;
    }

    for (const key of keys) {
      if (!has(obj, key) || obj[key] !== options[key]) {
        obj[key] = options[key]; // share the same object
      }
    }
  }
}
