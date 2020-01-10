export default (type: string, eventInitDict: any, customOptions: any) => {
  const event: any = eventInitDict == null ? new Event(type) : new Event(type, eventInitDict);

  if (customOptions != null) {
    for (const [key, value] of Object.entries(customOptions)) {
      event[key] = value;
    }
  }

  return event;
};
