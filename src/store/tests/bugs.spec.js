import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { loadBugs, addBug, resolveBug, getUnresolvedBugs,assignBugToUser, getBugsByUser } from "../bugs";
import configureStore from "../configureStore";

//integretion testi chunki tashqi manba bilan gaplashadi

describe("bugsSlice", () => {
    let fakeAxios;
    let store;

    // har bir funksiyadan oldin chaqiriladi
    beforeEach(() => {
        fakeAxios = new MockAdapter(axios);
        store = configureStore();
    });

    const bugsSlice = () => store.getState().entities.bugs;
    const createState = () => ({
        entities: {
            bugs: {
                list: [],
            },
        },
    });

    it("xato serverda xal qilingan bo'lsa, uni hal qilingan deb belgilash", async () => {
        // AAA
        fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, resolved: true });
        fakeAxios.onPost("/bugs").reply(200, { id: 1 });

        await store.dispatch(addBug({}));
        await store.dispatch(resolveBug(1));

        expect(bugsSlice().list[0].resolved).toBe(true);
    });

    describe("loading bugs", () => {
        describe("xatoliklar keshda bor bo'lsa", () => {
            it("cache da xatolar mavjud bo'lsa uni serverdan qayta olmay server olish keraj", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }])

                await store.dispatch(loadBugs())
                await store.dispatch(loadBugs())

                expect(fakeAxios.history.get.length).toBe(1)
            })
        })
        describe("xatoliklar keshda yo'q bo'lsa", () => {
            it("agar xatoliklar cache da bo'lmasa serverda olinishi va do'konga qo'yilishi kerak", async () => {
                fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }])

                await store.dispatch(loadBugs())

                expect(bugsSlice().list).toHaveLength(1)
            })

            describe("loading indefikator", () => {
                it("serverdan xatolar olinayotganda true bo'lishi", () => {
                    fakeAxios.onGet("/bugs").reply(() => {
                        expect(bugsSlice().loading).toBe(true)
                        return [200, [{ id: 1 }]]
                    })

                    store.dispatch(loadBugs())
                })
                it("serverdan xatolar olinagandan keyin false bo'lishi", async () => {
                    fakeAxios.onGet("/bugs").reply(200, [{ id: 1 }])

                    await store.dispatch(loadBugs())

                    expect(bugsSlice().loading).toBe(false)
                })
                it("serverdan xatolar olinagandan xato bersa false bo'lishi", async () => {
                    fakeAxios.onGet("/bugs").reply(500)

                    await store.dispatch(loadBugs())

                    expect(bugsSlice().loading).toBe(false)
                })
            })
        })
    })

    it("xato serverda xal qilinmagan bo'lsa, uni hal qinmagan deb belgilash", async () => {
        // AAA
        fakeAxios.onPatch("/bugs/1").reply(500);
        fakeAxios.onPost("/bugs").reply(200, { id: 1 });

        await store.dispatch(addBug({}));
        await store.dispatch(resolveBug(1));

        expect(bugsSlice().list[0].resolved).not.toBe(true);
    });

    it("xato tayinlash funksiyasi", async () => {
        // AAA
        fakeAxios.onPatch("/bugs/1").reply(200, {id:1,userId:4})
        fakeAxios.onPost("/bugs").reply(200, { id: 1});

        await store.dispatch(addBug({id:1}))
        await store.dispatch(assignBugToUser(1, 4));

        expect(bugsSlice().list[0].userId).toBe(4)
    });

    it("data serverga saqlangan bo'lsa do'konga ham saqlanishi kerak", async () => {
        const bug = { description: "a" };
        const savedBug = { ...bug, id: 1 };
        fakeAxios.onPost("/bugs").reply(200, savedBug);

        await store.dispatch(addBug(bug));

        expect(bugsSlice().list).toContainEqual(savedBug);
    });

    it("data serverga saqlanmagan bo'lsa do'konga ham saqlanmagan bo'lishi kerak", async () => {
        const bug = { description: "a" };
        fakeAxios.onPost("/bugs").reply(500);

        await store.dispatch(addBug(bug));

        expect(bugsSlice().list).toHaveLength(0);
    });



    describe("selector", () => {
        it("getUnresolvedBugs", () => {
            //AAA
            const state = createState();
            state.entities.bugs.list = [
                { id: 1, resolved: true },
                { id: 2 },
                { id: 3 },
            ];

            const result = getUnresolvedBugs(state);

            expect(result).toHaveLength(2);
        });

        it("xato tayinlangan objectni qaytarish",()=>{
            const state = createState();
            state.entities.bugs.list = [
                { id: 1, userId: 2 },
                { id: 2 },
                { id: 3 },
            ];

            const result = getBugsByUser(2)(state);

            expect(result).toContainEqual({id:1, userId:2})
        })

    });
});

// toza cod yozish uchum AAA tamoyilidan foydalanish kerak
// AAA
// Arrange ==> tartibga solish
// Act ==> harakat qilish
// Assert ==> tasdiqlash

// Yakkalik testlar

// describe("bugsSlice", () => {
//     describe("action creators", () => {
//         it("addBug", () => {
//             const bug = { description: 'a' }
//             const result = addBug(bug)
//             const expected = {
//                 type:apiCallBegan.type,
//                 payload: {
//                     url:'/bugs',
//                     method:'post',
//                     data:bug,
//                     onSuccess:bugAdded.type
//                 }
//             }
//             expect(result).toEqual(expected)
//         })
//     })
// })
