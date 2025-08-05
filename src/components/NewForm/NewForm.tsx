import { useState } from 'react';

function NewForm() {
  return (
    <form>
      <label htmlFor="task">Task:</label>
      <input type="text" id="task" name="task" />
      <button type="submit">Add Task</button>
    </form>
  );
}

export { NewForm };
