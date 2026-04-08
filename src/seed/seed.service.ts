import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse, Result } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {

  constructor(
        @InjectModel(Pokemon.name)
        private readonly pokemonModel:Model<Pokemon>
  ) { }

  private readonly axios:AxiosInstance=axios;


  async executeSeed():Promise<string> {
    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemons:Pokemon[]=[];

    data.results.forEach(({name,url})=>{
       const segments=url.split('/');
       const no:number=+segments[segments.length-2];
       const pokemon={
        name: name.toLocaleLowerCase().trim(),
        no
       }
       pokemons.push(pokemon as Pokemon);
    })

    try {
      await this.pokemonModel.deleteMany({});
     await this.pokemonModel.insertMany(pokemons);
    }catch(error){
      console.log({error});
      throw new ServiceUnavailableException('Error seeding the database');
    }

    return "Seed executed successfully";
  }
}
