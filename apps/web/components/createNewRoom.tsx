const createNewRoom = () => {
  return (
    <div className="">
      <button
        className={`${!openMenu.newRoom ? "block" : "hidden"} transition-all hover:scale-110 active:scale-95`}
        onClick={() =>
          setOpenMenu((prev) => ({ ...prev, newRoom: !prev.newRoom }))
        }
      >
        CreateNewRoom
      </button>
      <div
        className={`${openMenu.newRoom ? "block" : "hidden"} flex justify-center items-center gap-2`}
      >
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          type="text"
          placeholder="min 3char RoomName..."
          className="w-[60%] outline-none px-2 py-1 rounded-md text-xs md:text-sm"
        />
        <button
          onClick={() => handleNewRoom()}
          className="w-[30%] border px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-md transition-all bg-green-300 hover:bg-green-600 active:scale-95"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default createNewRoom;
