import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {


  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>
  ) {   
  }

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()


    try{
      const pokemon= await this.pokemonModel.create(createPokemonDto);
    
      return pokemon
    }catch(error: any){
      this.handleExceptions(error);
    }

   

  }

  findAll(paginationDto: PaginationDto) {

    const { limit=10, offset=0 } = paginationDto;

    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({no:1})
    .select('-__v');
  }

  async findOne(id: string):Promise<Pokemon> {
    
    let pokemon:Pokemon | null=null;

    //Search by no
    if(!isNaN(+id)){
     pokemon=await this.pokemonModel.findOne({no:+id})
    } 


    //MongoId 

    if(!pokemon && isValidObjectId(id)){
      pokemon=await this.pokemonModel.findById(id)
    }

    //Search by name
    if(!pokemon){
      pokemon=await this.pokemonModel.findOne({name:id.toLocaleLowerCase().trim()})
    }


    if(!pokemon) throw new NotFoundException(`Pokemon with term ${id} not found`)

    return pokemon;

  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon=await this.findOne(id);

     if(updatePokemonDto.name){
      updatePokemonDto.name=updatePokemonDto.name.toLocaleLowerCase();
     }


      try {
        await pokemon.updateOne(updatePokemonDto,{new:true})
      }catch (error:any) {
          this.handleExceptions(error);
      }
     

      return {...pokemon.toJSON(),...updatePokemonDto};
     

  }

  async remove(id: string) {

    //const pokemon = await this.findOne(id);

    
    //await pokemon.deleteOne();

    //const result=await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount}=await this.pokemonModel.deleteOne({_id:id});

    if(deletedCount===0){
      throw new BadRequestException(`Pokemon with id ${id} not found`)
    }

    return
  }


  private handleExceptions(error:any){
    if(error.code===11000){
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create pokemon - Check server logs`)
  }

}
